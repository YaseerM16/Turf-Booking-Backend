import jwt from "jsonwebtoken";
import { config } from "../../config/config";
import { IAuthService } from "../../app/interfaces/services/IAuthService";
import { User } from "../../domain/entities/User";

export class AuthService implements IAuthService {
    generateToken(user: any): string {
        try {
            const token = jwt.sign(user, config.JWT_SECRET!, {
                expiresIn: "30d",
            });
            return token;
        } catch (error: any) {
            // console.log("[AuthService.ts]Error While generating the Token: ", error);

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
}