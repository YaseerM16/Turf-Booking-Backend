import mongoose, { Document, Schema } from "mongoose";
import { IOtpRepository } from "../../domain/repositories/IOtpRepository";
import { Otp } from "../../domain/entities/Otp";
Otp



type OtpDocument = mongoose.Document & {
    _id: mongoose.Types.ObjectId;
    email: string;
    code: string;
    createdAt: Date;
}

const OtpSchema = new Schema<OtpDocument>({
    email: String,
    code: String,
    createdAt: { type: Date, default: Date.now }
})

const OtpModel = mongoose.model<OtpDocument>('Otp', OtpSchema)


export class MongoOtpRepository implements IOtpRepository {
    async create(otp: Otp): Promise<Otp> {
        const otpDoc = await new OtpModel(otp).save();
        return new Otp(otpDoc._id.toString(), otpDoc.email, otpDoc.code, otpDoc.createdAt)
    }
    async findByEmail(email: string): Promise<Otp | null> {
        const otpDoc = await OtpModel.findOne({ email })
        return otpDoc ? new Otp(otpDoc?._id.toString(), otpDoc?.email, otpDoc?.code, otpDoc?.createdAt) : null
    }
    async deleteByEmail(email: string): Promise<void> {
        await OtpModel.deleteOne({ email })
    }

}