import mongoose, { Schema } from "mongoose";
import { Company } from "../../../domain/entities/Company";

// Define the CompanySchema based on the Company entity
const CompanySchema = new Schema<Company>({
    companyname: {
        type: String,
        required: true,
    },
    companyemail: {
        type: String,
        required: true,
        unique: true,
    },
    phone: {
        type: Number,
        required: true,
    },
    password: {
        type: String,
        required: true,
    },
    isActive: {
        type: Boolean,
        default: true,
    },
    isVerified: {
        type: Boolean,
        default: false,
    },
    isApproved: {
        type: Boolean,
        default: false,
    },
    isBlocked: {
        type: Boolean,
        default: false,
    },
    profilePicture: {
        type: String,
    },
    verifyToken: {
        type: String,
    },
    verifyTokenExpiry: {
        type: Date,
    },
    forgotPasswordToken: {
        type: String,
    },
    forgotPasswordTokenExpiry: {
        type: Date,
    },
    location: {
        latitude: {
            type: Number,
            required: true,
        },
        longitude: {
            type: Number,
            required: true,
        }
    }
});

// Create the Company model using the schema
const CompanyModel = mongoose.model<Company>("Company", CompanySchema);

export default CompanyModel;
