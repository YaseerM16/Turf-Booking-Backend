import jwt from "jsonwebtoken";
import { config } from "../../config/config";
import { IAuthService } from "../../app/interfaces/services/IAuthService";
import { User } from "../../domain/entities/User";

export class AuthService implements IAuthService {
    generateToken(user: any): string {
        try {
            const token = jwt.sign(user, config.JWT_SECRET!, {
                expiresIn: "5m",
            });
            return token;
        } catch (error: any) {

            throw new Error(JSON.stringify({ message: "error in generating token", error }));
        }
    }
    verifyToken(token: string): User {
        try {
            const data = jwt.verify(token, config.JWT_SECRET!) as any;

            return data;
        } catch (error) {
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