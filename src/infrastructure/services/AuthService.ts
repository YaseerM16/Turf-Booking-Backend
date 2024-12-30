import jwt from "jsonwebtoken";
import { config } from "../../config/config";
import { IAuthService } from "../../app/interfaces/services/IAuthService";
import { User } from "../../domain/entities/User";

export class AuthService implements IAuthService {
    generateToken(user: any): string {
        try {
            console.log("(Auth Service) token generating :");

            const token = jwt.sign(user, config.JWT_SECRET!, {
                expiresIn: "1h",
            });
            return token;
        } catch (error: any) {

            throw new Error(JSON.stringify({ message: "error in generating token", error }));
        }
    }
    verifyToken(token: string, userId: string): User | object {
        try {
            // Try to decode the token without throwing an error
            const data = jwt.verify(token, config.JWT_SECRET!) as any
            // console.log("_id in VerifyToken :-", data._id);

            // Check if the user is verified
            if (data._id !== userId) {
                return { error: "User not verified", notVerified: true }; // Return custom error if not verified
            }

            // Return the user data if valid and verified
            return { user: data };
        } catch (error: any) {
            // Return custom error messages without throwing exceptions
            if (error instanceof jwt.TokenExpiredError) {
                return { error: "Token expired", expired: true }; // Token expired case
            } else if (error instanceof jwt.JsonWebTokenError) {
                return { error: "Invalid token" }; // Invalid token case
            } else {
                return { error: "User not authorized" }; // Other errors
            }
        }
    }

    isTokenExpired(token: string): boolean {
        try {
            if (!token) return true
            const decodedToken: any = jwt.decode(token)
            const currentTime = Math.floor(Date.now() / 1000);
            return decodedToken.exp < currentTime
        } catch (error) {
            console.log("Error in token expiry Check :", error);
            throw new Error("user not authorised");
        }
    }

    generateRefreshToken(user: any): string {
        try {
            return jwt.sign(user, config.JWT_REFRESH_SECRET!, { expiresIn: "3d" }); // Long-lived refresh token
        } catch (error: any) {
            throw new Error(JSON.stringify({ message: "error in generating refresh token", error }));
        }
    }

    verifyRefreshToken(refreshToken: string): User {
        try {
            const data = jwt.verify(refreshToken, config.JWT_REFRESH_SECRET!) as any;
            return data;
        } catch (error) {
            throw new Error("invalid refresh token");
        }
    }

}