import { NextFunction, Request, Response } from "express";
import { SendOtp } from "../../domain/useCases/SendOtp";
import { VerifyOtp } from "../../domain/useCases/VerifyOtp";
import { IUserUseCase } from "../usecases/IUserUseCase";
import { IAuthService } from "../interfaces/services/IAuthService";
import { ErrorResponse } from "../../utils/errors";
import { config } from "../../config/config";

SendOtp
VerifyOtp

export class UserController {
    constructor(private userUseCase: IUserUseCase, private authService: IAuthService) { }

    async registersUser(req: Request, res: Response): Promise<void> {
        try {
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
                    secure: config.MODE !== "development", // Use `true` in production
                    // sameSite: "strict", // Prevent CSRF
                    // path: "/refresh-token", // Restrict endpoint for token refresh
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

    async refreshAccessToken(req: Request, res: Response): Promise<void> {
        try {
            const refreshToken = req.cookies.refreshToken;

            if (!refreshToken) {
                res.status(401).json({ message: "Refresh token not found" });
            }

            // Verify refresh token
            const userData = this.authService.verifyRefreshToken(refreshToken);

            // Generate a new access token
            const newAccessToken = this.authService.generateToken(userData);

            res.status(200).json({ success: true, accessToken: newAccessToken });
        } catch (error) {
            res.status(403).json({ message: (error as Error).message });
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

    }

}