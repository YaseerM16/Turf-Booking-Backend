// src/domain/useCases/VerifyOtp.ts
import { IOtpRepository } from "../repositories/IOtpRepository";

export class VerifyOtp {
    constructor(private otpRepository: IOtpRepository) { }

    async execute(email: string, code: string): Promise<boolean> {
        const otp = await this.otpRepository.findByEmail(email);
        if (!otp) throw new Error("OTP not found");

        if (otp.isExpired()) {
            await this.otpRepository.deleteByEmail(email); // Clean up expired OTP
            throw new Error("OTP expired");
        }

        if (otp.code !== code) throw new Error("Invalid OTP");

        // OTP is valid; delete it after verification
        await this.otpRepository.deleteByEmail(email);
        return true;
    }
}
