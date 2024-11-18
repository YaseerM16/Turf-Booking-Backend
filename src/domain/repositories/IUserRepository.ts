import { User } from "../entities/User";

export interface IUserRepository {
    findByEmail(email: string): Promise<User | null>;
    update(id: string, value: any): Promise<User | null>;
    create(user: User): Promise<User>
}