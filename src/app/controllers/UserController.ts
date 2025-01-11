import e, { NextFunction, Request, Response } from "express";
import { IAuthService } from "../interfaces/services/IAuthService";
import { ErrorResponse } from "../../utils/errors";
import { config } from "../../config/config";
import { validationResult } from "express-validator"
import { IUserUseCase } from "../interfaces/usecases/user/IUserUseCase";
import { User } from "../../domain/entities/User";
import { generatePaymentHash } from "../../../src/infrastructure/services/BookingService"


export class UserController {
    constructor(private userUseCase: IUserUseCase, private authService: IAuthService) { }

    async registersUser(req: Request, res: Response): Promise<void> {
        try {
            const errors = validationResult(req);

            if (!errors.isEmpty()) {
                throw new ErrorResponse("Invalid email or password", 401);
            }
            console.log("CAlling signup UseCase :)");

            const user = await this.userUseCase.RegisterUser(req.body)

            const newUser = {
                ...JSON.parse(JSON.stringify(user)),
                password: undefined,
            };

            res.status(200).json({ success: true, user: newUser });

        } catch (error) {
            res.status(400).json({ message: (error as Error).message });
        }
    }

    async userLogin(req: Request, res: Response): Promise<void> {
        try {
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

            res
                .status(200)
                .json({ success: true, message: "Logged In successfully", user: userData, loggedIn: true });

        } catch (error) {
            console.error("Login Error:", error);
            res.status(400).json({ message: (error as Error).message });
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

            res.status(200).json({ success: true, user: newUser, message: "account verified" });

        } catch (error) {
            res.status(403).json({ message: (error as Error).message });
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

            res.status(200).json({ success: true, user: newUser, message: "account verified" });
        } catch (error) {
            res.status(403).json({ message: (error as Error).message });
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
            res.status(200).send({ success: true, user });

        } catch (error) {
            res.status(403).json({ message: (error as Error).message });
        }
    }

    async updateDetails(req: Request, res: Response): Promise<void> {
        try {
            const { userId } = req.params
            // console.log("THis is the updateDetails -:");

            // console.log("USer Id ::", userId);
            // console.log("updatedDets -::", req.body)

            const user = await this.userUseCase.updateProfileDetails(userId, req.body)

            if (!user) {
                res.status(404).json({ success: false, message: "User not found or update failed" });
                return
            }

            res.status(200).send({ success: true, user });

        } catch (error) {
            res.status(500).json({ message: "Internal server error", error });
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
            res.status(200).json({ success: true, turfs: turfs.turfs, totalTurfs: turfs.totalTurfs, message: "Turfs Fetched successfully :" });

        } catch (error: any) {
            res.status(500).json({ message: error?.message });
        }
    }

    async getTurfDetails(req: Request, res: Response) {
        try {
            const { turfId } = req.params
            const turf = await this.userUseCase.getTurfById(turfId)
            res.status(200).json({ success: true, turf, message: "Turf Detail Fetched successfully :" });
        } catch (error: any) {
            res.status(500).json({ message: error?.message });
        }
    }

    async getSlots(req: Request, res: Response) {
        try {
            const { turfId, day, date } = req.query
            // console.log("by Date :", date);

            const slots = await this.userUseCase.getSlotsByDay(turfId as string, day as string, date as string)
            res.status(200).json({ success: true, slots, message: "Turf Slots by Day Fetched successfully :" });

        } catch (error: any) {
            res.status(500).json({ message: error?.message });
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
            res.status(200).json({ success: true, bookings, message: "Bookings Fetched successfully :" });
        } catch (error: any) {
            res.status(500).json({ message: error?.message });
        }
    }

    async myWallet(req: Request, res: Response) {
        try {
            const { userId } = req.params
            const wallet = await this.userUseCase.getWalletbyId(userId)
            // console.log("This is the Mywallet C : userId ", userId);
            res.status(200).json({ success: true, wallet, message: "Wallet Fetched successfully :" });
        } catch (error: any) {
            res.status(500).json({ message: error?.message });
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
            res.status(200).json({ success: true, walletBalance, message: "Balance Checked successfully :" });

        } catch (error: any) {
            res.status(500).json({ message: error?.message, error });
        }
    }

    async bookSlotsByWallet(req: Request, res: Response) {
        try {
            const { userId } = req.params
            console.log("Book BY walLet is HEre >");
            console.log("UserId :", userId);
            console.log("SEelect Sltosf :", req.body);
            const isBookingCompleted = await this.userUseCase.bookSlotByWallet(userId, req.body)
            res.status(200).json({ success: true, isBookingCompleted, message: "Balance Checked successfully :" });
        } catch (error: any) {
            res.status(500).json({ message: error?.message, error });
        }
    }

}