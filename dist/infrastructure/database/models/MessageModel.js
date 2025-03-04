"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const messageSchema = new mongoose_1.default.Schema({
    senderId: {
        type: String,
        equired: true
    },
    receiverId: {
        type: String,
        required: true,
    },
    roomId: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'ChatRoom',
        required: true,
    },
    content: {
        type: String,
        required: true,
    },
    isRead: {
        type: Boolean,
        default: false,
    },
    deletedForSender: { type: Boolean, default: false },
    deletedForReceiver: { type: Boolean, default: false },
    isImage: {
        type: Boolean,
        default: false,
    },
}, {
    timestamps: true
});
const Message = mongoose_1.default.model('Message', messageSchema);
exports.default = Message;
