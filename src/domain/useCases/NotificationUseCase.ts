import { INotificationUseCase } from "../../app/interfaces/usecases/INotificationUseCase";
import { StatusCode } from "../../shared/enums/StatusCode";
import { ErrorResponse } from "../../shared/utils/errors";
import { INotificationRepository } from "../repositories/INotificationRepository";
export class NotificationUseCase implements INotificationUseCase {
    private notificationRepository: INotificationRepository;

    constructor(notificationRepository: INotificationRepository) {
        this.notificationRepository = notificationRepository;
    }
    async getNotifications(id: string, type: string): Promise<Notification[] | null> {
        try {
            if (!id || !type) throw new ErrorResponse("Id or type is not getting While try to Get Notifications.. !!", StatusCode.BAD_REQUEST);

            return await this.notificationRepository.getNotifications(id, type as "user" | "company");
        } catch (error: any) {
            throw new ErrorResponse(error.message, error.status);
        }
    }
    async updateNotifications(data: object, type: string): Promise<Notification[] | null> {
        try {
            if (!data || !type) throw new ErrorResponse("data for notification update is not getting While try to Update Notifications.. !!", StatusCode.BAD_REQUEST);
            return await this.notificationRepository.updateNotifications(data, type);
        } catch (error: any) {
            throw new ErrorResponse(error.message, error.status);
        }
    }
    async deleteNotifications(roomId: string, id: string, type: string): Promise<object> {
        try {
            console.log("roomId :", roomId, "Id :", id, "type :", type);

            if (!roomId || !id || !type) throw new ErrorResponse("data for notification update is not getting While try to Update Notifications.. !!", StatusCode.BAD_REQUEST);
            return await this.notificationRepository.deleteNotifications(roomId, id, type as "user" | "company");
        } catch (error: any) {
            throw new ErrorResponse(error.message, error.status);
        }
    }

}