import { User } from "../../domain/entities/User";
import { IUserRepository } from "../../domain/repositories/IUserRepository";
import { ErrorResponse } from "../../utils/errors";
import UserModel from "./models/UserModel";


export class MongoUserRepository implements IUserRepository {
    async findByEmail(email: string): Promise<User | null> {
        try {
            const userDoc = await UserModel.findOne({ email })
            return userDoc ? userDoc : null
        } catch (error: any) {
            throw new ErrorResponse(error.message, error.status);
        }
    }
    async create(user: User): Promise<User> {
        try {
            const userDoc = new UserModel(user)
            await userDoc.save()
            return userDoc

        } catch (error: any) {
            throw new ErrorResponse(error.message, error.status);
        }
    }
    async update(id: string, value: any): Promise<User | null> {
        try {
            const updatedUser = await UserModel.findByIdAndUpdate(id, value, {
                new: true,
                fields: "-password"
            });
            return updatedUser
        } catch (error: any) {
            throw new ErrorResponse(error.message, error.status);
        }
    }
}