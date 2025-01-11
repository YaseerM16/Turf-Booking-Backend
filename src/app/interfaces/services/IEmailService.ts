
import { Company } from "../../../domain/entities/Company";
import { User } from "../../../domain/entities/User";

export interface IEmailService {
    accountVerifyMail(user: any, type: string): Promise<void>;
}
