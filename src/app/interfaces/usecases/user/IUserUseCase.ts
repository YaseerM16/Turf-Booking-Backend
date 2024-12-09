import { User } from "../../../../domain/entities/User";

export interface IUserUseCase {
    RegisterUser(user: User): Promise<User>;
    verifyMail(
        type: string,
        token: string,
        email: string
    ): Promise<User | null>;
    updateProfileImage(_id: string, url: string): Promise<User | null>
    userLogin(email: string, password: string): Promise<User | null>
    updateProfileDetails(_id: string, data: string): Promise<User | null>
    forgotPassword(email: string): Promise<void>
    updatePassword(email: string, password: string): Promise<User | null>
}
