import { User } from "../entities/User";
import { IUserRepository } from "../repositories/IUserRepository"


class RegisterUser {
    constructor(private userRepository: IUserRepository) { }

    async execute(data: { id: string, name: string, email: string, phone: number, password: string }): Promise<User> {

        const existingUser = await this.userRepository.findByEmail(data.email)
        if (existingUser) throw new Error("User Already Exists :(");

        const user = new User(data.id, data.name, data.email, data.phone, data.password)
        if (!user.isValid()) throw new Error("User data is Invalid");

        return this.userRepository.create(user)

    }
}