"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const AuthService_1 = require("../services/AuthService");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const authService = new AuthService_1.AuthService();
class Authenticator {
    userAuthenticator(req, res, next) {
        var _a;
        try {
            // console.log("Hellow from USerAuthenticator ::)) ");
            let { token, refreshToken } = req.cookies;
            if (!token) {
                token = (_a = req.headers.authorization) === null || _a === void 0 ? void 0 : _a.split(" ")[1];
            }
            const decodedData = jsonwebtoken_1.default.decode(token);
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
                }
                else {
                    console.log("Refresh token is expired!");
                    res.json({
                        status: "error",
                        message: "Invalid or expired token",
                        refreshTokenExpired: true,
                    });
                    return;
                }
            }
            else if (!isAuthTokenExpired) {
                const verify = authService.verifyToken(token, userId);
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
        }
        catch (error) {
            res.status(401).json({
                message: "Invalid or expired token",
                error: error.message,
            });
        }
    }
    companyAuthenticator(req, res, next) {
        try {
            // console.log("Hellow from CompaNYAuthenticator ::)) ");
            const { CompanyToken, CompanyRefreshToken } = req.cookies;
            const decodedData = jsonwebtoken_1.default.decode(CompanyToken);
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
                }
                else {
                    console.log("Refresh token is expired!");
                    res.json({
                        status: "error",
                        message: "Invalid or expired token",
                        refreshTokenExpired: true,
                    });
                    return;
                }
            }
            else if (!isAuthTokenExpired) {
                const verify = authService.verifyToken(CompanyToken, userId);
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
        }
        catch (error) {
            res.status(401).json({
                message: "Invalid or expired token",
                error: error.message,
            });
        }
    }
    adminAuthenticator(req, res, next) {
        try {
            // console.log("Hellow from CompaNYAuthenticator ::)) ");
            const { AdminToken, AdminRefreshToken } = req.cookies;
            const decodedData = jsonwebtoken_1.default.decode(AdminToken);
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
                }
                else {
                    console.log("Refresh token is expired!");
                    res.json({
                        status: "error",
                        message: "Invalid or expired token",
                        refreshTokenExpired: true,
                    });
                    return;
                }
            }
            else if (!isAuthTokenExpired) {
                const verify = authService.verifyToken(AdminToken, userId);
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
        }
        catch (error) {
            res.status(401).json({
                message: "Invalid or expired token",
                error: error.message,
            });
        }
    }
}
exports.default = new Authenticator();
