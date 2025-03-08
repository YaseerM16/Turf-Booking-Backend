import { Request, Response, NextFunction } from "express";
import { User } from "../../domain/entities/User";
import { AuthService } from "../services/AuthService";
import jwt from "jsonwebtoken";

const authService = new AuthService();

export interface CustomRequest extends Request {
    user?: { id: string; role?: string };
}

class Authenticator {
    public userAuthenticator(req: CustomRequest, res: Response, next: NextFunction): void {
        try {
            // console.log("Hellow from USerAuthenticator ::)) ");

            let { token, refreshToken } = req.cookies;

            if (!token) {
                token = req.headers.authorization?.split(" ")[1];
            }

            const decodedData: any = jwt.decode(token);

            if (!decodedData) {
                res.status(401).json({ message: "Invalid token" });
                return;
            }

            const { userRole } = decodedData;
            const userId = decodedData._id;
            const isAuthTokenExpired = authService.isTokenExpired(token);
            const isRefreshTokenExpired = authService.isTokenExpired(refreshToken);

            if (isAuthTokenExpired) {
                if (!isRefreshTokenExpired) {
                    const data = authService.verifyRefreshToken(refreshToken);
                    if (data) {
                        const { _id, email } = decodedData;
                        const newAccessToken = authService.generateToken({ _id, email, userRole });

                        res.clearCookie("token");
                        res.cookie("token", newAccessToken, {
                            httpOnly: false,
                            secure: true,
                            sameSite: "none",
                            domain: 'turfbooking.online'
                        });

                        req.user = { id: _id, role: userRole };
                        next();
                        return;
                    }
                } else {
                    console.log("Refresh token is expired!");
                    res.json({
                        status: "error",
                        message: "Invalid or expired token",
                        refreshTokenExpired: true,
                    });
                    return;
                }
            } else if (!isAuthTokenExpired) {
                const verify: any = authService.verifyToken(token, userId);

                if (verify.notVerified) {
                    res.status(401).json({
                        message: "Verification for token is failed!",
                        verificationFailed: true,
                    });
                    return;
                }

                req.user = { id: userId, role: userRole };
                next();
                return;
            }
        } catch (error: any) {
            res.status(401).json({
                message: "Invalid or expired token",
                error: error.message,
            });
        }
    }
    public companyAuthenticator(req: CustomRequest, res: Response, next: NextFunction) {
        try {
            // console.log("Hellow from CompaNYAuthenticator ::)) ");

            const { CompanyToken, CompanyRefreshToken } = req.cookies;
            const decodedData: any = jwt.decode(CompanyToken);

            if (!decodedData) {
                res.status(401).json({ message: "Invalid token" });
                return;
            }

            const { userRole } = decodedData;
            const userId = decodedData._id;
            const isAuthTokenExpired = authService.isTokenExpired(CompanyToken);
            const isRefreshTokenExpired = authService.isTokenExpired(CompanyRefreshToken);

            if (isAuthTokenExpired) {
                if (!isRefreshTokenExpired) {
                    const data = authService.verifyRefreshToken(CompanyRefreshToken);
                    if (data) {
                        const { _id, email } = decodedData;
                        const newAccessToken = authService.generateToken({ _id, email, userRole });

                        res.clearCookie("CompanyToken");
                        res.cookie("CompanyToken", newAccessToken, {
                            httpOnly: false,
                            secure: true,
                            sameSite: "none",
                            domain: 'turfbooking.online'
                        });

                        req.user = { id: _id, role: userRole };
                        next();
                        return;
                    }
                } else {
                    console.log("Refresh token is expired!");
                    res.json({
                        status: "error",
                        message: "Invalid or expired token",
                        refreshTokenExpired: true,
                    });
                    return;
                }
            } else if (!isAuthTokenExpired) {
                const verify: any = authService.verifyToken(CompanyToken, userId);

                if (verify.notVerified) {
                    res.status(401).json({
                        message: "Verification for token is failed!",
                        verificationFailed: true,
                    });
                    return;
                }

                req.user = { id: userId, role: userRole };
                next();
                return;
            }

        } catch (error: any) {
            res.status(401).json({
                message: "Invalid or expired token",
                error: error.message,
            });
        }
    }

    public adminAuthenticator(req: CustomRequest, res: Response, next: NextFunction) {
        try {

            // console.log("Hellow from CompaNYAuthenticator ::)) ");

            const { AdminToken, AdminRefreshToken } = req.cookies;
            const decodedData: any = jwt.decode(AdminToken);

            if (!decodedData) {
                res.status(401).json({ message: "Invalid token" });
                return;
            }

            const { userRole } = decodedData;
            const userId = decodedData._id;
            const isAuthTokenExpired = authService.isTokenExpired(AdminToken);
            const isRefreshTokenExpired = authService.isTokenExpired(AdminRefreshToken);

            if (isAuthTokenExpired) {
                if (!isRefreshTokenExpired) {
                    const data = authService.verifyRefreshToken(AdminRefreshToken);
                    if (data) {
                        const { _id, email } = decodedData;
                        const newAccessToken = authService.generateToken({ _id, email, userRole });

                        res.clearCookie("AdminToken");
                        res.cookie("AdminToken", newAccessToken, {
                            httpOnly: false,
                            secure: true,
                            sameSite: "none",
                            domain: 'turfbooking.online'
                        });

                        req.user = { id: _id, role: userRole };
                        next();
                        return;
                    }
                } else {
                    console.log("Refresh token is expired!");
                    res.json({
                        status: "error",
                        message: "Invalid or expired token",
                        refreshTokenExpired: true,
                    });
                    return;
                }
            } else if (!isAuthTokenExpired) {
                const verify: any = authService.verifyToken(AdminToken, userId);

                if (verify.notVerified) {
                    res.status(401).json({
                        message: "Verification for token is failed!",
                        verificationFailed: true,
                    });
                    return;
                }

                req.user = { id: userId, role: userRole };
                next();
                return;
            }

        } catch (error: any) {
            res.status(401).json({
                message: "Invalid or expired token",
                error: error.message,
            });
        }
    }
}

export default new Authenticator();