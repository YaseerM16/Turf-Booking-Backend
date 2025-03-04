"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_1 = require("../../config/config");
class AuthService {
    generateToken(user) {
        try {
            console.log("(Auth Service) token generating :");
            const token = jsonwebtoken_1.default.sign(user, config_1.config.JWT_SECRET, {
                expiresIn: "1h",
            });
            return token;
        }
        catch (error) {
            throw new Error(JSON.stringify({ message: "error in generating token", error }));
        }
    }
    verifyToken(token, userId) {
        try {
            // Try to decode the token without throwing an error
            const data = jsonwebtoken_1.default.verify(token, config_1.config.JWT_SECRET);
            // console.log("_id in VerifyToken :-", data._id);
            // Check if the user is verified
            if (data._id !== userId) {
                return { error: "User not verified", notVerified: true }; // Return custom error if not verified
            }
            // Return the user data if valid and verified
            return { user: data };
        }
        catch (error) {
            // Return custom error messages without throwing exceptions
            if (error instanceof jsonwebtoken_1.default.TokenExpiredError) {
                return { error: "Token expired", expired: true }; // Token expired case
            }
            else if (error instanceof jsonwebtoken_1.default.JsonWebTokenError) {
                return { error: "Invalid token" }; // Invalid token case
            }
            else {
                return { error: "User not authorized" }; // Other errors
            }
        }
    }
    isTokenExpired(token) {
        try {
            if (!token)
                return true;
            const decodedToken = jsonwebtoken_1.default.decode(token);
            const currentTime = Math.floor(Date.now() / 1000);
            return decodedToken.exp < currentTime;
        }
        catch (error) {
            console.log("Error in token expiry Check :", error);
            throw new Error("user not authorised");
        }
    }
    generateRefreshToken(user) {
        try {
            return jsonwebtoken_1.default.sign(user, config_1.config.JWT_REFRESH_SECRET, { expiresIn: "3d" }); // Long-lived refresh token
        }
        catch (error) {
            throw new Error(JSON.stringify({ message: "error in generating refresh token", error }));
        }
    }
    verifyRefreshToken(refreshToken) {
        try {
            const data = jsonwebtoken_1.default.verify(refreshToken, config_1.config.JWT_REFRESH_SECRET);
            return data;
        }
        catch (error) {
            throw new Error("invalid refresh token");
        }
    }
}
exports.AuthService = AuthService;
