import { User } from "../../../domain/entities/User";

export interface IAuthService {
    generateRefreshToken(data: { _id: string | import("mongoose").Schema.Types.ObjectId; email: string; }): unknown;
    generateToken(user: any): string;
    verifyToken(token: string): User;
    verifyRefreshToken(refreshToken: string): User;
}