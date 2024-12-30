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
        console.log("Hellow form the Authenticatore ::");

        let { token, refreshToken } = req.cookies
        // if (!token || !refreshToken) {
        //     console.log("Token or Refresh is not found !!", token, refreshToken);
        //     throw new Error("Token not found in cookies");
        // }
        if (!token) {
            token = req.headers.authorization?.split(" ")[1]; // Extract the token from Authorization header
        }




        const decodedData: any = jwt.decode(token)
        // console.log("This si DecodedAssTiok :", decodedData);
        // console.log("this is exp form Decoded :", decodedData.exp);

        const { userRole } = decodedData
        const userId = decodedData._id

        // console.log("Middleware >>>");
        // console.log("DEcoded :", decodedData);

        // console.log("UserRole :", userRole);
        // console.log("UserID :", userId);


        const isAuthTokenExpired = authService.isTokenExpired(token)
        const isRefreshTokenExpired = authService.isTokenExpired(refreshToken)

        if (isAuthTokenExpired) {
            if (!isRefreshTokenExpired) {

                const data = authService.verifyRefreshToken(refreshToken)
                if (data) {
                    const _id = decodedData?._id
                    const email = decodedData.email
                    const newAccessToken = authService.generateToken({ _id, email, userRole })
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
                console.log("Refresh token Is Expired!!  ");
                res.json({
                    status: "error",
                    message: "Invalid or expired token",
                    refreshTokenExpired: true,
                });
            }

        } else if (!isAuthTokenExpired) {
            const verify: any = authService.verifyToken(token, userId)

            if (verify.notVerified) {
                console.log("TOken is NOT! verified in Authentiactor :!!");

                res.status(401).json({ message: "Verification for token is failed !", verificationFailed: true })
                return
            }
            // console.log("Provided Access form Middlewar TOken verifd 🐦‍🔥");
            req.user = { id: decodedData._id, role: decodedData.userRole };
            console.log("req.user is setted : the data :: ", decodedData._id, decodedData.userRole);

            next();
        }
    } catch (error: any) {
        res.status(401).json({ message: "Invalid or expired token", error: error.message });
    }
};
