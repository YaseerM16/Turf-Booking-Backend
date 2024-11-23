import { NextFunction, Request, Response } from "express";
import { SendOtp } from "../../domain/useCases/SendOtp";
import { VerifyOtp } from "../../domain/useCases/VerifyOtp";
import { IUserUseCase } from "../usecases/IUserUseCase";
import { IAuthService } from "../interfaces/services/IAuthService";
import { ErrorResponse } from "../../utils/errors";
import { config } from "../../config/config";
import { validationResult } from "express-validator"

SendOtp
VerifyOtp

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

            const user = await this.userUseCase.RegisterUser(req.body)

            const data = {
                ...JSON.parse(JSON.stringify(user)),
                password: undefined,
            };

            res.status(200).json({ success: true, user: data });

        } catch (error) {
            res.status(400).json({ message: (error as Error).message });
        }
    }



    async verifyAccount(req: Request, res: Response) {
        try {
            const { type, token, email } = req.query;

            const data = await this.userUseCase.verifyMail(type as string, token as string, email as string);

            if (data) {
                const user = {
                    ...JSON.parse(JSON.stringify(data)),
                    password: undefined,
                };
                const det = {
                    _id: data?._id,
                    email: data?.email,
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
            const imageUrl = (req.file as any)?.location

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
            res.status(200).send({ success: true, user });

        } catch (error) {
            res.status(403).json({ message: (error as Error).message });
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

}