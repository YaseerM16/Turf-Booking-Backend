"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Message = void 0;
class Message {
    constructor(_id, sender, receiver, senderId, receiverId, deletedForSender, deletedForReceiver, roomId, content, isRead = false, createdAt, updatedAt) {
        this._id = _id;
        this.sender = sender;
        this.receiver = receiver;
        this.senderId = senderId;
        this.receiverId = receiverId;
        this.deletedForSender = deletedForSender;
        this.deletedForReceiver = deletedForReceiver;
        this.roomId = roomId;
        this.content = content;
        this.isRead = isRead;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }
}
exports.Message = Message;
