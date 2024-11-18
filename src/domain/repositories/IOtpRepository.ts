import { Otp } from "../entities/Otp";

Otp

export interface IOtpRepository {
    create(otp: Otp): Promise<Otp>;
    findByEmail(email: string): Promise<Otp | null>
    deleteByEmail(email: string): Promise<void>
}