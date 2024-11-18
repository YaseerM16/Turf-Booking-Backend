import { User } from "../../../../domain/entities/User";

export interface IUserUseCase {
    RegisterUser(user: User): Promise<User>;
    verifyMail(
        type: string,
        token: string,
        email: string
    ): Promise<User | null>;
}
