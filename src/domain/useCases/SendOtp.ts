import { IOtpRepository } from "../repositories/IOtpRepository";
import { Otp } from "../entities/Otp";
import { IEmailService } from "../repositories/IEmailService";

export class SendOtp {
    constructor(
        private otpRepository: IOtpRepository,
        private emailService: IEmailService
    ) { }

    async execute(email: string): Promise<void> {
        await this.otpRepository.deleteByEmail(email);

        const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
        const otp = new Otp(Date.now().toString(), email, otpCode, new Date());

        await this.otpRepository.create(otp);

        // await this.emailService.sendOtp(email, otpCode);
    }
}
