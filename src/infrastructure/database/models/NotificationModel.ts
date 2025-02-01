import mongoose, { Schema, Document } from "mongoose";
import { Notification as NotificationEntity } from "../../../domain/entities/Notification"

// export interface INotification extends Document {
//     userId: string; // User receiving the notification
//     roomId: string;
//     companyId: string;
//     companyname: string;
//     lastMessage: string | null;
//     unreadCount: number;
//     updatedAt: Date;
//     user: {
//         name: string;
//         email: string;
//         phone: string;
//         profilePicture: string;
//     };
//     company: {
//         companyname: string;
//         companyEmail: string;
//         phone: string;
//         profilePicture: string;
//     };
// }

const NotificationSchema = new Schema<NotificationEntity>(
    {
        userId: { type: String, required: true }, // User who will receive the notification
        roomId: { type: String, required: true },
        companyId: { type: String, required: true },
        companyname: { type: String, required: true },

        unreadUserCount: { type: Number, default: 0 }, // Unread messages for the user
        unreadCompanyCount: { type: Number, default: 0 }, // Unread messages for the company

        userLastMessage: { type: String, default: null }, // Last message from the user
        companyLastMessage: { type: String, default: null }, // Last message from the company

        updatedAt: { type: Date, default: Date.now },

        user: {
            name: { type: String, required: true },
            email: { type: String, required: true },
            phone: { type: String, required: true },
            profilePicture: { type: String, default: null },
        },

        company: {
            companyname: { type: String, required: true },
            companyEmail: { type: String, required: true },
            phone: { type: String, required: true },
            profilePicture: { type: String, default: null },
        },
    },
    { timestamps: true }
);


const NotificationModel = mongoose.model<NotificationEntity>("Notification", NotificationSchema);
export default NotificationModel;
