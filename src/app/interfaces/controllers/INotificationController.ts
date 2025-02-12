import { Request, Response } from "express";

export interface INotificationController {
    getNotifications(req: Request, res: Response): Promise<void>;
    updateNotifications(req: Request, res: Response): Promise<void>;
    deleteNotifications(req: Request, res: Response): Promise<void>;
}