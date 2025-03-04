"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationRepository = void 0;
const StatusCode_1 = require("../../../shared/enums/StatusCode");
const errors_1 = require("../../../shared/utils/errors");
class NotificationRepository {
    constructor(notificationModel) {
        this.notificationModel = notificationModel;
    }
    getNotifications(id, type) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!id) {
                    throw new errors_1.ErrorResponse("ID is required while fetching notifications!", StatusCode_1.StatusCode.BAD_REQUEST);
                }
                const filter = type === "user" ? { userId: id } : { companyId: id };
                const notifications = yield this.notificationModel.find(filter).sort({ updatedAt: -1 });
                return notifications;
            }
            catch (error) {
                throw new errors_1.ErrorResponse(error.message, StatusCode_1.StatusCode.INTERNAL_SERVER_ERROR);
            }
        });
    }
    updateNotifications(data, type) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!data) {
                    throw new errors_1.ErrorResponse("Data for notification update is missing!", StatusCode_1.StatusCode.BAD_REQUEST);
                }
                const { userId, roomId, companyId, lastMessage, unreadCount, user, company, updatedAt, companyname } = data;
                const filter = type === "user" ? { userId, roomId } : { companyId, roomId };
                let notification = yield this.notificationModel.findOne(filter);
                if (notification) {
                    // Update existing notification
                    if (type === "user") {
                        notification.userLastMessage = lastMessage;
                        notification.unreadUserCount = unreadCount;
                    }
                    else {
                        notification.companyLastMessage = lastMessage;
                        notification.unreadCompanyCount = unreadCount;
                    }
                    notification.updatedAt = updatedAt;
                }
                else {
                    // Create a new notification
                    notification = new this.notificationModel({
                        userId,
                        companyname,
                        roomId,
                        companyId,
                        lastMessage,
                        unreadCount,
                        updatedAt,
                        user,
                        company,
                    });
                }
                yield notification.save();
                const notifications = yield this.notificationModel.find(type === "user" ? { userId } : { companyId }).sort({ updatedAt: -1 });
                return notifications;
            }
            catch (error) {
                throw new errors_1.ErrorResponse(error.message, StatusCode_1.StatusCode.INTERNAL_SERVER_ERROR);
            }
        });
    }
    deleteNotifications(roomId, id, type) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const filter = type === "user" ? { roomId, userId: id } : { roomId, companyId: id };
                const notificationExist = yield this.notificationModel.findOne(filter);
                if (!notificationExist) {
                    return { success: true, message: "No notification found." };
                }
                const updateFields = type === "user"
                    ? { unreadUserCount: 0, userLastMessage: null }
                    : { unreadCompanyCount: 0, companyLastMessage: null };
                yield this.notificationModel.updateOne(filter, { $set: updateFields });
                return { success: true, message: "Notification deleted successfully." };
            }
            catch (error) {
                throw new errors_1.ErrorResponse(error.message, StatusCode_1.StatusCode.INTERNAL_SERVER_ERROR);
            }
        });
    }
}
exports.NotificationRepository = NotificationRepository;
