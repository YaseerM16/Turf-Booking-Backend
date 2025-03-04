"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Notification = void 0;
class Notification {
    constructor(_id, userId, // User receiving the notification
    roomId, companyId, companyname, unreadUserCount, // Unread messages for the user
    unreadCompanyCount, // Unread messages for the company
    userLastMessage, // Last message from the user
    companyLastMessage, // Last message from the company
    updatedAt, user, company) {
        this._id = _id;
        this.userId = userId;
        this.roomId = roomId;
        this.companyId = companyId;
        this.companyname = companyname;
        this.unreadUserCount = unreadUserCount;
        this.unreadCompanyCount = unreadCompanyCount;
        this.userLastMessage = userLastMessage;
        this.companyLastMessage = companyLastMessage;
        this.updatedAt = updatedAt;
        this.user = user;
        this.company = company;
    }
}
exports.Notification = Notification;
