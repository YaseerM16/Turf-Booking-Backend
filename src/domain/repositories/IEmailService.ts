import { User } from "../entities/User";

export interface IEmailService {
    accountVerifyMail(user: User, type: string): Promise<void>;
}
