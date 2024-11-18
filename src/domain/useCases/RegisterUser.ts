import { User } from "../entities/User";
import { IUserRepository } from "../repositories/IUserRepository"


export class RegisterUser {
    constructor(private userRepository: IUserRepository) { }

    // async execute(data: User): Promise<User> {

    //     const existingUser = await this.userRepository.findByEmail(data.email)
    //     if (existingUser) throw new Error("User Already Exists :(");

    //     // const user = new User(data)
    //     // if (!user.isValid()) throw new Error("User data is Invalid");
    //     await this.userRepository.create(data)
    //     // return User

    // }
}