import { ObjectId } from "mongoose"

export class User {
    constructor(
        public _id: ObjectId | string,
        public googleId: string,
        public name: string,
        public email: string,
        public phone: number,
        public password: string,
        public role: string,
        public isActive: boolean,
        public isVerified: boolean,
        public profilePicture: string,
        public verifyToken: string | undefined,
        public verifyTokenExpiry: Date | undefined,
        public forgotPasswordToken: string | undefined,
        public forgotPasswordTokenExpiry: Date | undefined
    ) { }
}