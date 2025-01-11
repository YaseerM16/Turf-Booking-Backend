import { Company } from "../entities/Company";
import { User } from "../entities/User";
Company

export interface IEmailService {
    accountVerifyMail(user: any, type: string): Promise<void>;
}
