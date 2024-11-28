import mongoose, { Schema } from "mongoose"
import { User } from "../../../domain/entities/User"

const UserSchema = new Schema<User>({

    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
    },
    phone: {
        type: Number,
    },
    password: {
        type: String,
    },
    isActive: {
        type: Boolean,
        default: true,
    },
    isVerified: {
        type: Boolean,
        default: false,
    },
    isDelete: {
        type: Boolean,
        default: false,
    },
    profilePicture: {
        type: String,
    },
    role: {
        type: String,
    },
    verifyToken: {
        type: String,
    },
    verifyTokenExpiry: {
        type: Date,
    },
    forgotPasswordTokenExpiry: {
        type: Date,
    },
    forgotPasswordToken: {
        type: String,
    }

})


const UserModel = mongoose.model<User>("Clean-User", UserSchema)

export default UserModel