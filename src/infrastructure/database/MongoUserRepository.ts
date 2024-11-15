import { User } from "../../domain/entities/User";
import { IUserRepository } from "../../domain/repositories/IUserRepository";
import mongoose, { Document, Schema } from "mongoose";

type UserDocument = mongoose.Document & {
    _id: mongoose.Types.ObjectId;
    name: string;
    email: string;
    phone: number;
    password: string;
};

const UserSchema = new Schema<UserDocument>({
    name: String,
    email: String,
    phone: Number,
    password: String
})


const UserModel = mongoose.model<UserDocument>("Clean-User", UserSchema)

export class MongoUserRepository implements IUserRepository {
    async findByEmail(email: string): Promise<User | null> {
        const userDoc = await UserModel.findOne({ email }) as UserDocument
        return userDoc ? new User(userDoc._id.toString(), userDoc.name, userDoc.email, userDoc.phone, userDoc.password) : null
    }
    async create(user: User): Promise<User> {
        const userDoc = await new UserModel(user).save()
        return new User(userDoc._id.toString(), userDoc.name, userDoc.email, userDoc.phone, userDoc.password)
    }
}