import { User } from "../entities/User";
import { IUserRepository } from "../repositories/IUserRepository"
import { IEmailService } from "../repositories/IEmailService";
import { ErrorResponse } from "../../shared/utils/errors";
import { comparePassword, generateHashPassword } from "../../infrastructure/services/PasswordService";
import { IUserUseCase } from "../../app/interfaces/usecases/user/IUserUseCase";
import { AuthService } from "../../infrastructure/services/AuthService";
import { Turf } from "../entities/Turf";
import { Slot } from "../entities/Slot";
import UserModel from "../../infrastructure/database/models/UserModel";
import { Wallet } from "../entities/Wallet";
import { BalanceCheckResult } from "../../shared/utils/interfaces";
AuthService


export class UserUseCase implements IUserUseCase {
    constructor(private userRepository: IUserRepository, private mailService: IEmailService) { }

    async googleRegister(email: string, username: string): Promise<User | null> {
        try {
            const existingUser = await this.userRepository.findByEmail(email)

            if (existingUser) throw new ErrorResponse("user aldready registered", 400);

            const newUser = await this.userRepository.googleRegister(email, username)

            return newUser
        } catch (error: any) {
            throw new ErrorResponse(error.message, error.status);
        }
    }

    async googleLogin(email: string): Promise<User | null> {
        try {
            const existingUser = await this.userRepository.findByEmail(email)

            if (!existingUser) throw new ErrorResponse("user not found", 400);

            return existingUser
        } catch (error: any) {
            throw new ErrorResponse(error.message, error.status);
        }
    }

    async RegisterUser(data: User): Promise<User> {
        try {

            const existingUser = await this.userRepository.findByEmail(data.email)

            if (existingUser) throw new ErrorResponse("user aldready registered", 400);

            if (data.password) {
                const hashedPassword = await generateHashPassword(data.password);
                data.password = hashedPassword;
            }

            console.log("Createing NewUser :)");
            const newUser = await this.userRepository.create(data);

            const plainUser = {
                id: newUser._id,
                email: newUser.email,
                name: newUser.name,
                // Add other fields as required
            };

            await this.mailService.accountVerifyMail(plainUser, "verifyEmail");
            console.log("Mail Sended :) ");

            return newUser

        } catch (error: any) {
            console.log("Error is Throwing in UserUseCase :", error);
            throw new ErrorResponse(error.message, error.status);
        }
    }

    async sendVerificationMail(userId: string): Promise<void> {
        try {
            const user = await this.userRepository.findById(userId)

            if (!user) throw new ErrorResponse("User not found for creating the Wallet.", 404);

            await this.mailService.accountVerifyMail(user, "verifyEmail");

        } catch (error: any) {
            console.error("Failed to send verification email:", error.message);
        }
    }

    async userLogin(email: string, password: string): Promise<User | null> {
        try {
            let user = await this.userRepository.findByEmail(email);

            if (!user || !user.password) {
                throw new ErrorResponse("user dosen't exist", 400);
            }
            const passwordMatch = await comparePassword(password, user.password);

            if (!passwordMatch) {
                throw new ErrorResponse("password dosen't match", 401);
            }

            if (!user.isActive) {
                throw new ErrorResponse("Your Account is Blocked..!!", 403);
            }

            return user;
        } catch (error: any) {
            throw new ErrorResponse(error.message, error.status);
        }
    }

    async verifyMail(type: string, token: string, email: string): Promise<User | null> {
        try {
            const user = await this.userRepository.findByEmail(email);
            // console.log("User email in VerifyMail :", user?.email);


            if (type === "verifyEmail" && user?.verifyTokenExpiry) {
                const date = user.verifyTokenExpiry.getTime();

                if (date < Date.now()) {
                    throw new ErrorResponse("Token expired", 400);
                }

                if (user.verifyToken === token) {
                    const data = {
                        isVerified: true,
                        verifyToken: "",
                        verifyTokenExpiry: "",
                    };

                    let updatedUser = await this.userRepository.update(
                        user._id.toString(),
                        data
                    );

                    return updatedUser;
                } else {
                    throw new ErrorResponse("Invalid verification token", 400);
                }
            } else if (type === "forgotPassword" && user?.forgotPasswordTokenExpiry) {

                const date = user.forgotPasswordTokenExpiry.getTime();

                if (date < Date.now()) {
                    throw new ErrorResponse("Token expired", 400);
                }

                if (user.forgotPasswordToken === token) {
                    const data = {
                        isVerified: true,
                        forgotPasswordToken: "",
                        forgotPasswordTokenExpiry: "",
                    };

                    let updatedUser = await this.userRepository.update(
                        user._id.toString(),
                        data
                    );
                    return updatedUser;
                } else {
                    throw new ErrorResponse("Invalid password reset token", 400);
                }
            }
            return user;
        } catch (error: any) {
            throw new ErrorResponse(error.message, error.status);
        }
    }

    async updateProfileImage(_id: string, url: string): Promise<User | null> {
        try {
            const data = { profilePicture: url };
            const user = await this.userRepository.update(_id, data);
            if (!user) {
                throw new ErrorResponse("User not found or update failed", 404);  // Handling not found
            }
            return user;
        } catch (error: any) {
            throw new ErrorResponse(error.message, error.status);
        }
    }

    async updateProfileDetails(_id: string, data: string): Promise<User | null> {
        try {
            console.log("Update Dets for APi : ", data);

            const user = await this.userRepository.update(_id, data);
            if (!user) {
                throw new ErrorResponse("User not found or update failed", 404);  // Handling not found
            }
            return user;
        } catch (error: any) {
            throw new ErrorResponse(error.message, error.status);
        }
    }

    async forgotPassword(email: string): Promise<void> {
        try {
            const user = await this.userRepository.findByEmail(email);

            if (!user) {
                throw new ErrorResponse("User not found", 404);
            }
            await this.mailService.accountVerifyMail(user, "forgotPassword");
            return;
        } catch (error: any) {
            throw new ErrorResponse(error.message, error.status);
        }
    }

    async updatePassword(email: string, password: string): Promise<User | null> {
        try {
            const hashedPassword = await generateHashPassword(password);

            const user = await this.userRepository.findByEmail(email);

            const updatedUser = await this.userRepository.update(user?._id.toString()!, {
                password: hashedPassword,
            });
            return updatedUser;

        } catch (error: any) {
            throw new ErrorResponse(error.message, error.status);
        }
    }

    async getAllTurfs(queryobj: any): Promise<{ turfs: Turf[], totalTurfs: number }> {
        try {
            const page = parseInt(queryobj.page as string) || 1; // Default to page 1 if not provided
            const limit = parseInt(queryobj.limit as string) || 10;
            const searchQry = queryobj.searchQry as string
            const filter = {
                type: queryobj.type as string || "",
                size: queryobj.size as string || "",
                price: queryobj.price as string || ""
            }
            // console.log("page : ", page);
            // console.log("limit : ", limit);
            // console.log("searchQry : ", searchQry);
            // console.log("filter : ", filter);
            const query = { page, limit, searchQry, filter }

            const turfs = await this.userRepository.getAllTurfs(query)
            return { turfs: turfs.turfs, totalTurfs: turfs.totalTurfs }
        } catch (error: any) {
            throw new ErrorResponse(error.message, error.status);
        }
    }

    async getTurfById(turfId: string): Promise<Turf | null> {
        try {
            const turf = await this.userRepository.getTurfById(turfId)
            return turf
        } catch (error: any) {
            throw new ErrorResponse(error.message, error.status);
        }
    }

    async getSlotsByDay(turfId: string, day: string, date: string): Promise<{ slots: Slot[]; price: number | null }> {
        try {
            const slots = await this.userRepository.getSlotByDay(turfId, day, date)
            return slots
        } catch (error: any) {
            throw new ErrorResponse(error.message, error.status);
        }
    }

    async bookTheSlots(fullDetails: any): Promise<object> {
        try {
            const { udf1, udf2, udf3, udf4, amount, slots, addedon, status, txnid, mode } = fullDetails
            const bookingData = {
                userId: udf1,
                companyId: udf2,
                turfId: udf4,
                selectedSlots: slots,
                totalAmount: amount,
                status: "completed",
                paymentStatus: 'completed',
                paymentMethod: mode,
                paymentTransactionId: txnid,
                paymentDate: null,
                bookingDate: new Date(),
                isRefunded: false,
                isActive: true,
            };


            const isBooked: any = await this.userRepository.bookTheSlots(bookingData)

            if (isBooked?.success) {
                return isBooked
            }

            return { success: false, message: "Failed to book the Slots ..!!" }

        } catch (error: any) {
            throw new ErrorResponse(error.message, error.status);
        }
    }

    async getBookingOfUser(userId: string, page: number, limit: number): Promise<{ bookings: any[], totalBookings: number } | null> {
        try {
            const userBookings = await this.userRepository.getBookingByUserId(userId, page, limit)
            return userBookings
        } catch (error: any) {
            throw new ErrorResponse(error.message, error.status);
        }
    }

    async createWallet(userId: string): Promise<object> {
        try {

            const wallet = this.userRepository.createWallet(userId)

            if (wallet) {
                return {
                    success: true,
                    data: wallet,
                    message: "Wallet created successfully.",
                };
            }

            return {
                success: false,
                message: "Failed to create wallet. Please try again.",
                status: 500,
            };

        } catch (error: any) {
            throw new ErrorResponse(error.message, error.status);
        }
    }

    async getWalletbyId(userId: string): Promise<Wallet | null> {
        try {
            const wallet = await this.userRepository.getWalletById(userId)
            return wallet
        } catch (error: any) {
            throw new ErrorResponse(error.message, error.status);
        }
    }

    async cancelTheSlot(userId: string, slotId: string, bookingId: string): Promise<object> {
        try {
            const isCancelled: any = await this.userRepository.cancleTheSlot(userId, slotId, bookingId)

            if (isCancelled.success) {
                return isCancelled
            }
            return { success: false, message: "Failed to Cancel the Slots ..!!" }

        } catch (error: any) {
            throw new ErrorResponse(error.message, error.status);
        }
    }

    async checkBalance(userId: string, total: number): Promise<BalanceCheckResult> {
        try {
            if (!userId || total <= 0) {
                throw new ErrorResponse("Invalid input parameters.", 400);
            }
            const balanceCheckResult = await this.userRepository.checkWalletBalance(userId, total);
            return balanceCheckResult;
        } catch (error: any) {
            console.error("Error checking balance for user:", userId, error);
            throw new ErrorResponse(error.message || "Error checking balance.", error.status || 500);
        }
    }

    async bookSlotByWallet(userId: string, bookingDets: object): Promise<object> {
        try {
            if (!userId || !bookingDets) {
                throw new ErrorResponse("Invalid input parameters for booking by wallet :.", 400);
            }
            const isBooked = await this.userRepository.bookSlotsByWallet(userId, bookingDets);
            return isBooked;
        } catch (error: any) {
            throw new ErrorResponse(error.message || "Error checking balance.", error.status || 500);
        }
    }

}