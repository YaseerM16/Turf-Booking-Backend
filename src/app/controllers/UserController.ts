import e, { NextFunction, Request, Response } from "express";
import { IAuthService } from "../interfaces/services/IAuthService";
import { ErrorResponse } from "../../utils/errors";
import { config } from "../../config/config";
import { validationResult } from "express-validator"
import { IUserUseCase } from "../interfaces/usecases/user/IUserUseCase";
import { User } from "../../domain/entities/User";


export class UserController {
    constructor(private userUseCase: IUserUseCase, private authService: IAuthService) { }

    async registersUser(req: Request, res: Response): Promise<void> {
        try {
            const errors = validationResult(req);

            if (!errors.isEmpty()) {
                throw new ErrorResponse("Invalid email or password", 401);
            }

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
                } else if (type == "forgotPassword") {
                    res
                        .status(200)
                        .json({ success: true, message: "account verified", token, forgotMail: true });
                }
            }
        } catch (error: any) {
            throw new ErrorResponse(error.message, error.status);
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

            const user = await this.userUseCase.updateProfileDetails(userId, req.body)
            if (!user) {
                res.status(404).json({ success: false, message: "User not found or update failed" });
                return
            }

            res.status(200).send({ success: true, user });
            return

        } catch (error) {
            res.status(500).json({ message: "Internal server error" });
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

}