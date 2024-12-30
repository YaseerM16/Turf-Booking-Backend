import { ObjectId } from "mongoose"

export class Company {
    constructor(
        public _id: ObjectId | string,
        public googleId: string,
        public companyname: string,
        public companyemail: string,
        public phone: number,
        public password: string,
        public isActive: boolean,
        public isVerified: boolean,
        public isBlocked: boolean,
        public isApproved: boolean,
        public profilePicture: string,
        public verifyToken: string | undefined,
        public verifyTokenExpiry: Date | undefined,
        public forgotPasswordToken: string | undefined,
        public forgotPasswordTokenExpiry: Date | undefined,
        public location: { latitude: number; longitude: number },
        public address: string
    ) { }
}