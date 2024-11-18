import { ErrorResponse } from "../../utils/errors";
import { User } from "../../domain/entities/User";
import { IUserRepository } from "../../domain/repositories/IUserRepository";
import { generateHashPassword } from "./PasswordService";
import { sendMail } from "../../utils/sendMail";
import { IEmailService } from "../../app/interfaces/services/IEmailService";
User
sendMail
export class MailService implements IEmailService {
    private repository;
    constructor(repository: IUserRepository) {
        this.repository = repository
    }
    async accountVerifyMail(user: User, type: string): Promise<void> {
        try {
            let token = await generateHashPassword(user._id.toString());
            const currentDate = new Date();
            const twoDaysLater = new Date(currentDate);

            if (type === "verifyEmail") {
                twoDaysLater.setDate(currentDate.getDate() + 2);
                user.verifyToken = token;

                user.verifyTokenExpiry = twoDaysLater;
            } else if (type === "forgotPassword") {
                twoDaysLater.setDate(currentDate.getDate() + 1);
                user.forgotPasswordToken = token;
                user.forgotPasswordTokenExpiry = twoDaysLater;
            }

            let data = await this.repository.update(user._id.toString(), user);
            await sendMail(user.name, user.email, type, token);

        } catch (error: any) {
            throw new ErrorResponse(error.message, error.status);
        }
    }

}
