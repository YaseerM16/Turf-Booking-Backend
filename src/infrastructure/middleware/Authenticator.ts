import { Request, Response, NextFunction } from "express";
import { User } from "../../domain/entities/User";
import { AuthService } from "../services/AuthService";
import jwt from "jsonwebtoken";

const authService = new AuthService();

export const Authenticator = (req: Request, res: Response, next: NextFunction): void => {
    try {
        const { token, refreshToken } = req.cookies
        const decodedData: any = jwt.decode(token)
        const { userRole } = decodedData
        const userId = decodedData._id
        // console.log("userRole : ", userRole);
        // console.log("user_id", userId);



        const isAuthTokenExpired = authService.isTokenExpired(token)
        const isRefreshTokenExpired = authService.isTokenExpired(refreshToken)

        if (isAuthTokenExpired) {
            if (!isRefreshTokenExpired) {
                console.log("Acess token is expired and Intialized :");

                const data = authService.verifyRefreshToken(refreshToken)
                if (data) {
                    const userId = decodedData?._id
                    const email = decodedData.email
                    const newAccessToken = authService.generateToken({ userId, email })
                    res.clearCookie("token"); // This will attempt to clear the cookie with the default path
                    res.cookie("token", newAccessToken, {
                        httpOnly: false,
                        secure: false,
                        sameSite: "lax",
                    });
                    console.log("Generated the new access token Sucessfully 🐦‍🔥");
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
            // console.log("Verify Result :- ", verify);

            if (verify.notVerified) {
                res.status(401).json({ message: "Verification for token is failed !", verificationFailed: true })
                return
            }
            console.log("Provided Access form Middlewar TOken verifd 🐦‍🔥");
            next();
        }
    } catch (error: any) {
        res.status(401).json({ message: "Invalid or expired token", error: error.message });
    }
};
