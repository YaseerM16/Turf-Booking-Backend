import { INotificationRepository } from "../../../domain/repositories/INotificationRepository";
import { StatusCode } from "../../../shared/enums/StatusCode";
import { ErrorResponse } from "../../../shared/utils/errors";
import { Model } from "mongoose";
import { Notification as NotificationEntity } from "../../../domain/entities/Notification"



export class NotificationRepository implements INotificationRepository {

    private notificationModel: Model<NotificationEntity>;

    constructor(notificationModel: Model<NotificationEntity>) {
        this.notificationModel = notificationModel;
    }

    async getNotifications(id: string, type: "user" | "company"): Promise<Notification[] | null> {
        try {
            if (!id) {
                throw new ErrorResponse("ID is required while fetching notifications!", StatusCode.BAD_REQUEST);
            }

            const filter = type === "user" ? { userId: id } : { companyId: id };

            const notifications = await this.notificationModel.find(filter).sort({ updatedAt: -1 });

            return notifications as unknown as Notification[];
        } catch (error) {
            throw new ErrorResponse((error as Error).message, StatusCode.INTERNAL_SERVER_ERROR);
        }
    }


    async updateNotifications(data: any, type: "user" | "company"): Promise<Notification[] | null> {
        try {
            if (!data) {
                throw new ErrorResponse("Data for notification update is missing!", StatusCode.BAD_REQUEST);
            }

            const { userId, roomId, companyId, lastMessage, unreadCount, user, company, updatedAt, companyname } = data;

            const filter = type === "user" ? { userId, roomId } : { companyId, roomId };

            let notification = await this.notificationModel.findOne(filter);

            if (notification) {
                // Update existing notification
                if (type === "user") {
                    notification.userLastMessage = lastMessage;
                    notification.unreadUserCount = unreadCount;
                } else {
                    notification.companyLastMessage = lastMessage;
                    notification.unreadCompanyCount = unreadCount;
                }
                notification.updatedAt = updatedAt;
            } else {
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

            await notification.save();

            const notifications = await this.notificationModel.find(type === "user" ? { userId } : { companyId }).sort({ updatedAt: -1 });

            return notifications as unknown as Notification[];
        } catch (error) {
            throw new ErrorResponse((error as Error).message, StatusCode.INTERNAL_SERVER_ERROR);
        }
    }


    async deleteNotifications(roomId: string, id: string, type: "user" | "company"): Promise<object> {
        try {
            const filter = type === "user" ? { roomId, userId: id } : { roomId, companyId: id };

            const notificationExist = await this.notificationModel.findOne(filter);
            if (!notificationExist) {
                return { success: true, message: "No notification found." };
            }

            const updateFields =
                type === "user"
                    ? { unreadUserCount: 0, userLastMessage: null }
                    : { unreadCompanyCount: 0, companyLastMessage: null };

            await this.notificationModel.updateOne(filter, { $set: updateFields });

            return { success: true, message: "Notification deleted successfully." };
        } catch (error) {
            throw new ErrorResponse((error as Error).message, StatusCode.INTERNAL_SERVER_ERROR);
        }
    }

}