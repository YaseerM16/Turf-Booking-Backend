import { User } from "../entities/User";
import { IUserRepository } from "../repositories/IUserRepository"
import { IEmailService } from "../repositories/IEmailService";
import { ErrorResponse } from "../../utils/errors";
import { generateHashPassword } from "../../infrastructure/services/PasswordService";
import { IUserUseCase } from "../../app/interfaces/usecases/user/IUserUseCase";
import { AuthService } from "../../infrastructure/services/AuthService";
// import { IUserUseCase } from "../../app/usecases/IUserUseCase";
AuthService


export class UserUseCase implements IUserUseCase {
    constructor(private userRepository: IUserRepository, private mailService: IEmailService) { }

    async RegisterUser(data: User): Promise<User> {
        try {
            const existingUser = await this.userRepository.findByEmail(data.email)

            if (existingUser) throw new ErrorResponse("user aldready registered", 400);

            if (data.password) {
                const hashedPassword = await generateHashPassword(data.password);
                data.password = hashedPassword;
            }

            const newUser = await this.userRepository.create(data);

            if (!newUser.googleId) {
                await this.mailService.accountVerifyMail(newUser, "verifyEmail");
            }

            return newUser

        } catch (error: any) {
            throw new ErrorResponse(error.message, error.status);
        }
    }
    async verifyMail(type: string, token: string, email: string): Promise<User | null> {
        try {
            const user = await this.userRepository.findByEmail(email);

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
                        verifyTokenExforgotPasswordTokenExpirypiry: "",
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
            return user;
        } catch (error: any) {
            throw new ErrorResponse(error.message, error.status);
        }
    }


}