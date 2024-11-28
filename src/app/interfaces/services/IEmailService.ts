
import { Company } from "../../../domain/entities/Company";
import { User } from "../../../domain/entities/User";

export interface IEmailService {
    accountVerifyMail(user: (User | Company), type: string): Promise<void>;
}
