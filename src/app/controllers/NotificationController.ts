import { Request, Response } from "express";
import { INotificationUseCase } from "../interfaces/usecases/INotificationUseCase";
import { sendResponse } from "../../shared/utils/responseUtil";
import { StatusCode } from "../../shared/enums/StatusCode";
// import { NotificationUseCase } from "../useCases/NotificationUseCase";
// import { sendResponse } from "../utils/responseHandler";
// import { StatusCode } from "../utils/statusCodes";

export class NotificationController {
    private notificationUseCase: INotificationUseCase;

    constructor(notificationUseCase: INotificationUseCase) {
        this.notificationUseCase = notificationUseCase;
    }

    async getNotifications(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const { type } = req.query;
            console.log("Get_NOtify");

            const notifications = await this.notificationUseCase.getNotifications(id, type as string);
            sendResponse(res, true, "Notifications fetched successfully", StatusCode.SUCCESS, { notifications });
        } catch (error) {
            sendResponse(res, false, (error as Error).message, StatusCode.INTERNAL_SERVER_ERROR);
        }
    }

    async updateNotifications(req: Request, res: Response) {
        try {
            const { type } = req.query;
            const updatedNotifications = await this.notificationUseCase.updateNotifications(req.body, type as string);
            sendResponse(res, true, "Notifications updated successfully", StatusCode.SUCCESS, { notifications: updatedNotifications });
        } catch (error) {
            sendResponse(res, false, (error as Error).message, StatusCode.INTERNAL_SERVER_ERROR);
        }
    }

    async deleteNotifications(req: Request, res: Response) {
        try {
            const { roomId, id } = req.params; // `id` can be userId or companyId
            const { type } = req.query;
            const updatedNotifications = await this.notificationUseCase.deleteNotifications(roomId, id, type as string);
            sendResponse(res, true, "Notification deleted successfully", StatusCode.SUCCESS, { notifications: updatedNotifications });
        } catch (error) {
            // console.log("This is ERRR insdie delNotify : ", error);
            sendResponse(res, false, (error as Error).message, StatusCode.INTERNAL_SERVER_ERROR);
        }
    }
}
