import e, { NextFunction, Request, Response } from "express";
import { IAuthService } from "../interfaces/services/IAuthService";
import { ErrorResponse } from "../../shared/utils/errors";
import { config } from "../../config/config";
import { validationResult } from "express-validator"
import { IUserUseCase } from "../interfaces/usecases/user/IUserUseCase";
import { User } from "../../domain/entities/User";
import { generatePaymentHash } from "../../../src/infrastructure/services/BookingService"
import { StatusCode } from "../../shared/enums/StatusCode";
import { sendResponse } from "../../shared/utils/responseUtil";

export class UserController {

    constructor(
        private readonly userUseCase: IUserUseCase,
        private readonly authService: IAuthService
    ) { }

    async registersUser(req: Request, res: Response): Promise<void> {
        try {

            console.log("1111");

            const user = await this.userUseCase.RegisterUser(req.body)

            const newUser = {
                ...JSON.parse(JSON.stringify(user)),
                password: undefined,
            };

            // const response = new ResponseModel(true, "User Registered Successfully :)", { user: newUser })
            // res.status(StatusCode.SUCCESS).json(response)
            sendResponse(res, true, "User Registered Successfully ✅", StatusCode.SUCCESS, { user: newUser })

        } catch (error) {
            // const response = new ResponseModel(false, (error as Error).message)
            // res.status(StatusCode.BAD_REQUEST).json(response)
            sendResponse(res, false, (error as Error).message, StatusCode.BAD_REQUEST)
        }
    }

    async userLogin(req: Request, res: Response): Promise<void> {
        try {
            console.log("LOGin by the Controooolllller is Called");

            const errors = validationResult(req);

            if (!errors.isEmpty()) {
                throw new ErrorResponse("Invalid email or password", 401);
            }

            const { email, password } = req.body

            const user: User | null = await this.userUseCase.userLogin(email, password)
            const userData = {
                ...JSON.parse(JSON.stringify(user)),
                password: undefined,
            };

            const det: any = {
                _id: user?._id,
                email: user?.email,
                userRole: "user"
            };
            const token = this.authService.generateToken(det);
            const refreshToken = this.authService.generateRefreshToken(det)

            res.cookie("refreshToken", refreshToken, {
                httpOnly: true,
                secure: config.MODE !== "development",
                sameSite: "lax"
            });

            res.cookie("token", token, {
                httpOnly: false,
                secure: false,
                sameSite: "lax",
            });

            sendResponse(res, true, "Logged In Successfully ✅", StatusCode.SUCCESS, { user: userData, loggedIn: true })

        } catch (error) {
            console.log("Err res by Login:", error);

            sendResponse(res, false, (error as Error).message, StatusCode.BAD_REQUEST)
        }
    }

    async googleSingUp(req: Request, res: Response): Promise<void> {
        try {
            const { email, displayName } = req.body
            const user: User | null = await this.userUseCase.googleRegister(email, displayName)

            const newUser = {
                ...JSON.parse(JSON.stringify(user)),
                password: undefined,
            };
            // console.log("Google supg ", req.body);
            const det: any = {
                _id: user?._id,
                email: user?.email,
                userRole: "user"
            };
            const token = this.authService.generateToken(det);
            const refreshToken = this.authService.generateRefreshToken(det)

            res.cookie("refreshToken", refreshToken, {
                httpOnly: true,
                secure: config.MODE !== "development",
                sameSite: "lax"
            });

            res.cookie("token", token, {
                httpOnly: false,
                secure: false,
                sameSite: "lax",
            });

            sendResponse(res, true, "Registered Successfully ..!✅", StatusCode.SUCCESS, { user: newUser })

        } catch (error) {
            sendResponse(res, false, (error as Error).message, StatusCode.FORBIDDEN)
        }
    }

    async googleLogin(req: Request, res: Response) {
        try {
            const { email } = req.body
            const user: User | null = await this.userUseCase.googleLogin(email)
            const newUser = {
                ...JSON.parse(JSON.stringify(user)),
                password: undefined,
            };
            // console.log("Google supg ", req.body);
            const det: any = {
                _id: user?._id,
                email: user?.email,
                userRole: "user"
            };
            const token = this.authService.generateToken(det);
            const refreshToken = this.authService.generateRefreshToken(det)

            res.cookie("refreshToken", refreshToken, {
                httpOnly: true,
                secure: config.MODE !== "development",
                sameSite: "lax"
            });

            res.cookie("token", token, {
                httpOnly: false,
                secure: false,
                sameSite: "lax",
            });

            sendResponse(res, true, "Logged In Successfully ..!", StatusCode.SUCCESS, { user: newUser })

        } catch (error) {
            sendResponse(res, false, (error as Error).message, StatusCode.FORBIDDEN)
        }
    }

    async verifyAccount(req: Request, res: Response) {
        try {
            const { type, token, email } = req.query;

            const data = await this.userUseCase.verifyMail(type as string, token as string, email as string);

            if (data) {
                if (type == "verifyEmail") {
                    const user = {
                        ...JSON.parse(JSON.stringify(data)),
                        password: undefined,
                    };
                    const creatWallet: any = await this.userUseCase.createWallet(user?._id)
                    if (creatWallet?.success) {
                        const det: any = {
                            _id: user?._id,
                            email: user?.email,
                            userRole: "user"
                        };
                        const token = this.authService.generateToken(det);
                        const refreshToken = this.authService.generateRefreshToken(det)

                        res.cookie("refreshToken", refreshToken, {
                            httpOnly: true,
                            secure: config.MODE !== "development",
                            sameSite: "lax"
                        });

                        res.cookie("token", token, {
                            httpOnly: false,
                            secure: false,
                            sameSite: "lax",
                        });

                        res
                            .status(200)
                            .json({ success: true, message: "account verified", user, token });
                    } else {
                        res.status(500).json({ message: "Internal server error while creating Wallet for this User :( " });
                    }
                } else if (type == "forgotPassword") {
                    res
                        .status(200)
                        .json({ success: true, message: "account verified", token, forgotMail: true });
                }
            }
        } catch (error: any) {
            res.status(500).json({ message: "Internal server error", error });
        }
    }

    async getVerificationMail(req: Request, res: Response) {
        try {
            const { userId } = req.params
            await this.userUseCase.sendVerificationMail(userId)
            res.status(200).json({ success: true, message: "Email was sent successfully :)" });
        } catch (error) {
            res.status(500).json({ message: "Internal server error while try to send the verification mail :", error });
        }
    }

    async updateProfileImage(
        req: Request,
        res: Response,
    ): Promise<void> {
        try {
            const { userId } = req.params
            const imageUrl = (req.files as any)?.profileImage?.[0].location
            if (!imageUrl) {
                res.status(400).send("Profile image is required");
            }
            const user = await this.userUseCase.updateProfileImage(userId, imageUrl);
            sendResponse(res, true, "Profile Image Updated Successfully ..✅", StatusCode.SUCCESS, { user })

        } catch (error) {
            sendResponse(res, false, (error as Error).message, StatusCode.FORBIDDEN)
        }
    }

    async updateDetails(req: Request, res: Response): Promise<void> {
        try {
            const { userId } = req.params

            const user = await this.userUseCase.updateProfileDetails(userId, req.body)

            if (!user) {
                sendResponse(res, false, "User not found or update failed !.. ❌", StatusCode.NOT_FOUND)
                return
            }

            sendResponse(res, true, "Profile has been Updated Successfully! ✅", StatusCode.SUCCESS, { user, success: true })

        } catch (error) {
            sendResponse(res, false, (error as Error).message, StatusCode.INTERNAL_SERVER_ERROR)
        }
    }

    async logout(req: Request, res: Response) {
        try {
            res.clearCookie('token');
            res.clearCookie('refreshToken');

            res.status(200).json({ message: 'Logged out successfully', loggedOut: true });

        } catch (error) {
            console.error('Error during logout:', error);
            res.status(500).json({ message: 'Something went wrong during logout' });
        }
    };

    async forgotPassword(req: Request, res: Response) {
        try {
            const { email } = req.body;
            console.log("Email in forgotpassword :", email);

            const data = await this.userUseCase.forgotPassword(email);

            res
                .status(200)
                .json({ success: true, message: "mail send successfully" });

        } catch (error: any) {
            res.status(500).json({ message: error?.message });
        }
    }

    async passwordUpdate(req: Request, res: Response) {
        try {
            const { email, newPassword } = req.body;
            console.log("Email : ", email);
            console.log("Password : ", newPassword);

            const user = await this.userUseCase.updatePassword(email, newPassword);
            res.clearCookie('token');
            res.clearCookie('refreshToken');

            res.status(200).json({ success: true });
        } catch (error: any) {
            res.status(500).json({ message: error?.message });
        }
    }

    async getTurfs(req: Request, res: Response) {
        try {
            const query = req.query
            // console.log("Queries in getTurfsofUser :", query);

            const turfs = await this.userUseCase.getAllTurfs(query)
            sendResponse(res, true, "Turfs Fetched successfully ..!!", StatusCode.SUCCESS, { turfs: turfs.turfs, totalTurfs: turfs.totalTurfs })
            // res.status(200).json({ success: true, turfs: turfs.turfs, totalTurfs: turfs.totalTurfs, message: "Turfs Fetched successfully :" });

        } catch (error: unknown) {
            sendResponse(res, false, (error as Error).message, StatusCode.INTERNAL_SERVER_ERROR)
            // res.status(500).json({ message: error?.message });
        }
    }

    async getTurfDetails(req: Request, res: Response) {
        try {
            const { turfId } = req.params
            const turf = await this.userUseCase.getTurfById(turfId)
            // res.status(200).json({ success: true, turf, message: "Turf Detail Fetched successfully :" });
            sendResponse(res, true, "Turf Detail Fetched successfully ..!", StatusCode.SUCCESS, { turf })
        } catch (error: unknown) {
            sendResponse(res, false, (error as Error).message, StatusCode.INTERNAL_SERVER_ERROR)
        }
    }

    async getSlots(req: Request, res: Response) {
        try {
            const { turfId, day, date } = req.query
            // console.log("by Date :", date);

            const slots = await this.userUseCase.getSlotsByDay(turfId as string, day as string, date as string)
            sendResponse(res, true, "Turf Slots by Day Fetched successfully ..!", StatusCode.SUCCESS, { slots })
            // res.status(200).json({ success: true, slots, message: "Turf Slots by Day Fetched successfully :" });

        } catch (error: unknown) {
            sendResponse(res, false, (error as Error).message, StatusCode.INTERNAL_SERVER_ERROR)
            // res.status(500).json({ message: error?.message });
        }
    }

    async getPaymentHash(req: Request, res: Response) {
        try {
            // console.log("GET PYMENT HASH ");
            // console.log("REQuest BODY in getPaymntHash :", req.body);
            const { txnid, amount, productinfo, name: username, email, udf1, udf2, udf3, udf4, udf5, udf6, udf7 } = req.body;
            if (
                !txnid ||
                !amount ||
                !productinfo ||
                !username ||
                !email ||
                !udf1 ||
                !udf2 ||
                !udf3 ||
                !udf4
            ) {
                console.log("Some Field is NOT !!!");
                res.status(400).send("Mandatory fields missing");
                return;
            }

            const hash = await generatePaymentHash({
                txnid, amount, productinfo, username, email, udf1, udf2, udf3, udf4, udf5, udf6, udf7,
            });
            // console.log('last', { hash, udf6, udf7 });

            res.send({ hash, udf6, udf7 });

        } catch (error: any) {
            res.status(500).json({ message: error?.message });
        }
    }

    async saveBooking(req: Request, res: Response) {
        try {
            // console.log("Save Bookiing is Aprochec*)");
            // console.log("bookingDets in Controller : ", req.body);
            const isBooked: any = await this.userUseCase.bookTheSlots(req.body)

            // console.log("Sending BOOKeD Dets ;", isBooked);

            if (isBooked.success) {
                res.status(200).json({ success: true, isBooked, message: "Turf Slots was Booked successfully :" });
            } else {
                res.status(500).json({ success: false, message: "Something went wrong while booking the slots !! :" });
            }

        } catch (error: any) {
            console.log("THRowing Error from SaveBooking :", error);
            res.status(500).json({ message: error?.message });
        }
    }

    async getBookings(req: Request, res: Response) {
        try {
            const { userId, page, limit } = req.query
            const bookings = await this.userUseCase.getBookingOfUser(userId as string, page as unknown as number, limit as unknown as number)
            // res.status(200).json({ success: true, bookings, message: "Bookings Fetched successfully :" });
            sendResponse(res, true, "Bookings Fetched successfully :", StatusCode.SUCCESS, { bookings })
        } catch (error: any) {
            sendResponse(res, false, (error as Error).message, StatusCode.INTERNAL_SERVER_ERROR)
            // res.status(500).json({ message: error?.message });
        }
    }

    async myWallet(req: Request, res: Response) {
        try {
            const { userId } = req.params
            const wallet = await this.userUseCase.getWalletbyId(userId)
            // console.log("This is the Mywallet C : userId ", userId);
            sendResponse(res, true, "Wallet Fetched successfully !", StatusCode.SUCCESS, { wallet })
        } catch (error: any) {
            sendResponse(res, false, (error as Error).message, StatusCode.INTERNAL_SERVER_ERROR)
        }
    }

    async cancelSlot(req: Request, res: Response) {
        try {
            const { userId, slotId, bookingId } = req.params
            const isCancelled: any = await this.userUseCase.cancelTheSlot(userId, slotId, bookingId)

            if (isCancelled.success) {
                res.status(200).json({ success: true, booking: isCancelled, message: "Slots has been Cancelled successfully :" });
            } else {
                res.status(500).json({ success: false, message: "Something went wrong while Cancelling the slots !! :" });
            }

        } catch (error: any) {
            res.status(500).json({ message: error?.message, error });
        }
    }

    async checkWalletBalance(req: Request, res: Response) {
        try {
            const { userId } = req.params
            const total = Number(req.query.grandTotal)

            const walletBalance = await this.userUseCase.checkBalance(userId, total)
            sendResponse(res, true, "Balance Checked successfully ..!", StatusCode.SUCCESS, { walletBalance })
            // res.status(200).json({ success: true, walletBalance, message: "Balance Checked successfully :" });

        } catch (error: unknown) {
            sendResponse(res, false, (error as Error).message, StatusCode.INTERNAL_SERVER_ERROR)
            // res.status(500).json({ message: error?.message, error });
        }
    }

    async bookSlotsByWallet(req: Request, res: Response) {
        try {
            const { userId } = req.params
            // console.log("Book BY walLet is HEre >");
            // console.log("UserId :", userId);
            // console.log("SEelect Sltosf :", req.body);
            const isBookingCompleted = await this.userUseCase.bookSlotByWallet(userId, req.body)
            sendResponse(res, true, "Balance Checked successfully ..!", StatusCode.SUCCESS, { isBookingCompleted })
            // res.status(200).json({ success: true, isBookingCompleted, message: "Balance Checked successfully :" });
        } catch (error: unknown) {
            sendResponse(res, false, (error as Error).message, StatusCode.INTERNAL_SERVER_ERROR)
            // res.status(500).json({ message: error?.message, error });
        }
    }

    async createChatRoom(req: Request, res: Response) {
        try {
            const { userId, companyId } = req.params
            const chatRoom = await this.userUseCase.createChatRoom(userId, companyId)
            sendResponse(res, true, "Chat Room has been Created or getting successfully ..!", StatusCode.SUCCESS, { room: chatRoom })
        } catch (error) {
            sendResponse(res, false, (error as Error).message, StatusCode.INTERNAL_SERVER_ERROR)
        }
    }

    async onSendMessage(req: Request, res: Response) {
        try {
            const { userId, companyId } = req.params
            const sendMessage = await this.userUseCase.sendMessage(userId, companyId, req.body)
            sendResponse(res, true, "Message Sent Successfully", StatusCode.SUCCESS, { message: sendMessage })
        } catch (error) {
            sendResponse(res, false, (error as Error).message, StatusCode.INTERNAL_SERVER_ERROR)
        }
    }

    async getMessages(req: Request, res: Response) {
        try {
            const { roomId } = req.params
            const messages = await this.userUseCase.getMessages(roomId)
            sendResponse(res, true, "Messages Fetched Successfully ..!", StatusCode.SUCCESS, { messages })
        } catch (error) {
            sendResponse(res, false, (error as Error).message, StatusCode.INTERNAL_SERVER_ERROR)
        }
    }

    async getChats(req: Request, res: Response) {
        try {
            const { userId } = req.params
            const chats = await this.userUseCase.getChats(userId)
            sendResponse(res, true, "Chats Fetched Successfully ..:)", StatusCode.SUCCESS, { chats })
        } catch (error) {
            sendResponse(res, false, (error as Error).message, StatusCode.INTERNAL_SERVER_ERROR)
        }
    }

    async getNotifications(req: Request, res: Response) {
        try {
            const { userId } = req.params
            const notifications = await this.userUseCase.getNotifications(userId)
            sendResponse(res, true, "Notifications fetched successfully :", StatusCode.SUCCESS, { notifications })
        } catch (error) {
            sendResponse(res, false, (error as Error).message, StatusCode.INTERNAL_SERVER_ERROR)
        }
    }

    async updateNotificaitons(req: Request, res: Response) {
        try {
            const updatedNotifications = await this.userUseCase.updateNotifications(req.body)
            sendResponse(res, true, "Notifications fetched successfully :", StatusCode.SUCCESS, { notifications: updatedNotifications })
        } catch (error) {
            sendResponse(res, false, (error as Error).message, StatusCode.INTERNAL_SERVER_ERROR)
        }
    }

    async deleteNotifications(req: Request, res: Response) {
        try {
            const { roomId, userId } = req.params
            const deleteNotification = await this.userUseCase.deleteNotifications(roomId, userId)
            sendResponse(res, true, "Notification is Deleted Successfully :!", StatusCode.SUCCESS)
        } catch (error) {
            sendResponse(res, false, (error as Error).message, StatusCode.INTERNAL_SERVER_ERROR)
        }
    }

    async messageDeleteForEveryOne(req: Request, res: Response) {
        try {
            const { messageId } = req.params
            const updatedMessage = await this.userUseCase.deleteForEveryOne(messageId)
            sendResponse(res, true, "Notification is Deleted Successfully :!", StatusCode.SUCCESS, { message: updatedMessage })
        } catch (error) {
            sendResponse(res, false, (error as Error).message, StatusCode.INTERNAL_SERVER_ERROR)
        }
    }

    async messageDeleteForMe(req: Request, res: Response) {
        try {
            const { messageId } = req.params
            const updatedMessage = await this.userUseCase.deleteForMe(messageId)
            sendResponse(res, true, "Notification is Deleted Successfully :!", StatusCode.SUCCESS, { message: updatedMessage })
        } catch (error) {
            sendResponse(res, false, (error as Error).message, StatusCode.INTERNAL_SERVER_ERROR)
        }
    }

}