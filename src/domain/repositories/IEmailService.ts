import { Company } from "../entities/Company";
import { User } from "../entities/User";
Company

export interface IEmailService {
    accountVerifyMail(user: (User | Company), type: string): Promise<void>;
}
