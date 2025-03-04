"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
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
const NotificationSchema = new mongoose_1.Schema({
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
}, { timestamps: true });
const NotificationModel = mongoose_1.default.model("Notification", NotificationSchema);
exports.default = NotificationModel;
