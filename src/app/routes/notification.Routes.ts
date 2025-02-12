import express, { Request, Response, Router } from "express";
import { NotificationController } from "../controllers/NotificationController";
import { NotificationUseCase } from "../../domain/useCases/NotificationUseCase";
import { NotificationRepository } from "../../infrastructure/database/repositories/NotificationRepository";
import NotificationModel from "../../infrastructure/database/models/NotificationModel";
import Authenticator from "../../infrastructure/middleware/Authenticator";
import AccessControl from "../../infrastructure/middleware/AccessControl";


const router: Router = express.Router()

const notificationRepo = new NotificationRepository(NotificationModel)
const notificationUseCase = new NotificationUseCase(notificationRepo)
const notificationController = new NotificationController(notificationUseCase)

router.get(
    "/get-notifications/:id",
    Authenticator.userAuthenticator,
    AccessControl.isUserBlocked,
    (req: Request, res: Response) => notificationController.getNotifications(req, res))


export { router as notificationRoute }