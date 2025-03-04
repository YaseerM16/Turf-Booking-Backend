"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatRoom = void 0;
class ChatRoom {
    constructor(_id, userId, companyId, lastMessage = null, isReadUc = 0, isReadDc = 0, createdAt = new Date(), updatedAt = new Date() // Optional if you want to track updates
    ) {
        this._id = _id;
        this.userId = userId;
        this.companyId = companyId;
        this.lastMessage = lastMessage;
        this.isReadUc = isReadUc;
        this.isReadDc = isReadDc;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }
}
exports.ChatRoom = ChatRoom;
