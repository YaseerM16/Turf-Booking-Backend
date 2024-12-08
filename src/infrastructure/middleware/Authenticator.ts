import { Request, Response, NextFunction } from "express";
import { User } from "../../domain/entities/User";
import { AuthService } from "../services/AuthService";
import jwt from "jsonwebtoken";

const authService = new AuthService();

export interface CustomRequest extends Request {
    user?: { id: string; role?: string };
}

export const Authenticator = (req: CustomRequest, res: Response, next: NextFunction): void => {
    try {
        const { token, refreshToken } = req.cookies
        const decodedData: any = jwt.decode(token)
        const { userRole } = decodedData
        const userId = decodedData._id

        console.log("UserRole :", userRole);


        const isAuthTokenExpired = authService.isTokenExpired(token)
        const isRefreshTokenExpired = authService.isTokenExpired(refreshToken)

        if (isAuthTokenExpired) {
            if (!isRefreshTokenExpired) {

                const data = authService.verifyRefreshToken(refreshToken)
                if (data) {
                    const userId = decodedData?._id
                    const email = decodedData.email
                    const newAccessToken = authService.generateToken({ userId, email, userRole })
                    res.clearCookie("token");
                    res.cookie("token", newAccessToken, {
                        httpOnly: false,
                        secure: false,
                        sameSite: "lax",
                    });
                    req.user = { id: decodedData?._id, role: decodedData?.userRole }
                    next();
                }
            } else if (isRefreshTokenExpired) {
                res.json({
                    status: "error",
                    message: "Invalid or expired token",
                    refreshTokenExpired: true,
                });
            }

        } else if (!isAuthTokenExpired) {
            const verify: any = authService.verifyToken(token, userId)

            if (verify.notVerified) {
                res.status(401).json({ message: "Verification for token is failed !", verificationFailed: true })
                return
            }
            // console.log("Provided Access form Middlewar TOken verifd 🐦‍🔥");
            req.user = { id: decodedData._id, role: decodedData.userRole };
            next();
        }
    } catch (error: any) {
        res.status(401).json({ message: "Invalid or expired token", error: error.message });
    }
};
