import express, { Request, Response, Router } from "express";
import { CompanyController } from "../controllers/CompanyController";
import { CompanyRepository } from "../../infrastructure/database/repositories/CompanyRepository";
import { CompanyUseCase } from "../../domain/useCases/CompanyUseCase";
import { AuthService } from "../../infrastructure/services/AuthService";
import { MailService } from "../../infrastructure/services/EmailService";
import { uploadMiddleware } from "../../infrastructure/multer/multerConfig";
import Authenticator from "../../infrastructure/middleware/Authenticator";
import AccessControl from "../../infrastructure/middleware/AccessControl";
import { IEmailService } from "../interfaces/services/IEmailService";
import { ICompanyRepository } from "../../domain/repositories/ICompanyRepository";
import { IUserRepository } from "../../domain/repositories/IUserRepository";
import { MongoUserRepository } from "../../infrastructure/database/repositories/UserRepository";
import { NotificationRepository } from "../../infrastructure/database/repositories/NotificationRepository";
import NotificationModel from "../../infrastructure/database/models/NotificationModel";
import { NotificationUseCase } from "../../domain/useCases/NotificationUseCase";
import { NotificationController } from "../controllers/NotificationController";

const router: Router = express.Router()


const companyRepository: ICompanyRepository = new CompanyRepository()
const userRepository: IUserRepository = new MongoUserRepository()
const emailService: IEmailService = new MailService(companyRepository, userRepository)
const companyUseCase = new CompanyUseCase(companyRepository, emailService)
const authService = new AuthService()
const companyController = new CompanyController(companyUseCase, authService)

const notificationRepo = new NotificationRepository(NotificationModel)
const notificationUseCase = new NotificationUseCase(notificationRepo)
const notificationController = new NotificationController(notificationUseCase)

//Authentication
router.post("/auth/register", (req: Request, res: Response) => companyController.registerCompany(req, res))
router.get("/auth/verifymail", (req: Request, res: Response) => companyController.verifyAccount(req, res))
router.post("/auth/login", (req: Request, res: Response) => companyController.companyLogin(req, res))
router.post("/auth/forgot-password", (req: Request, res: Response) => companyController.forgotPassword(req, res))
router.post("/auth/update-password", (req: Request, res: Response) => companyController.passwordUpdate(req, res))
router.get("/logout", (req: Request, res: Response) => companyController.logout(req, res))


//Profile
router.patch("/profile/upload-image/:companyId",
    Authenticator.companyAuthenticator,
    AccessControl.isCompanyBlocked,
    uploadMiddleware,
    (req: Request, res: Response) => companyController.updateProfileImage(req, res)
)
router.patch("/profile/update-details/:companyId",
    Authenticator.companyAuthenticator,
    AccessControl.isCompanyBlocked,
    (req: Request, res: Response) => companyController.updateDetails(req, res)
)


//Turf-Management
router.post("/register-turf",
    Authenticator.companyAuthenticator,
    AccessControl.isCompanyBlocked, uploadMiddleware,
    (req: Request, res: Response) => companyController.registerTurf(req, res))
router.get("/get-turfs",
    Authenticator.companyAuthenticator,
    AccessControl.isCompanyBlocked,
    (req: Request, res: Response) => companyController.getTurfs(req, res))
router.get("/get-turf-details/:companyId/:turfId",
    Authenticator.companyAuthenticator,
    AccessControl.isCompanyBlocked,
    (req: Request, res: Response) => companyController.getTurfDetails(req, res))
router.delete("/delete-turf-image/:turfId/:index",
    Authenticator.companyAuthenticator,
    AccessControl.isCompanyBlocked,
    (req: Request, res: Response) => companyController.deleteTurfImage(req, res))
router.put("/edit-turf",
    uploadMiddleware,
    Authenticator.companyAuthenticator,
    AccessControl.isCompanyBlocked,
    (req: Request, res: Response) => companyController.editTurf(req, res))
router.patch("/block-turf",
    Authenticator.companyAuthenticator,
    AccessControl.isCompanyBlocked,
    (req: Request, res: Response) => companyController.blockTurf(req, res))
router.patch("/Un-block-turf",
    Authenticator.companyAuthenticator,
    AccessControl.isCompanyBlocked,
    (req: Request, res: Response) => companyController.unBlockTurf(req, res))


//Slot-Management
router.get("/get-slots-by-day",
    Authenticator.companyAuthenticator,
    AccessControl.isCompanyBlocked,
    (req: Request, res: Response) => companyController.getSlots(req, res))
router.get("/make-slot-unavailable",
    Authenticator.companyAuthenticator,
    AccessControl.isCompanyBlocked,
    (req: Request, res: Response) => companyController.makeSlotUnavail(req, res))
router.get("/make-slot-available",
    Authenticator.companyAuthenticator,
    AccessControl.isCompanyBlocked,
    (req: Request, res: Response) => companyController.makeSlotAvail(req, res))
router.patch("/:turfId/add-working-days",
    Authenticator.companyAuthenticator,
    AccessControl.isCompanyBlocked,
    (req: Request, res: Response) => companyController.addWorkingDays(req, res))
router.get("/get-details-by-day/:turfId/:day",
    Authenticator.companyAuthenticator,
    AccessControl.isCompanyBlocked,
    (req: Request, res: Response) => companyController.getDetailsOfDay(req, res))
router.patch("/edit-day-details/:turfId",
    Authenticator.companyAuthenticator,
    AccessControl.isCompanyBlocked,
    (req: Request, res: Response) => companyController.editWorkingDayDetails(req, res))

// router.get("/example-gen-slots/:turfId", (req: Request, res: Response) => companyController.genExampleOneDay(req, res))

////////// CHAT ////////////////

router.post("/create-chat-room/:companyId/:userId",
    Authenticator.companyAuthenticator,
    AccessControl.isCompanyBlocked,
    (req: Request, res: Response) => companyController.createChatRoom(req, res))
router.get("/get-chat-lists/:companyId",
    Authenticator.companyAuthenticator,
    AccessControl.isCompanyBlocked,
    (req: Request, res: Response) => companyController.getChatLists(req, res))
router.get("/get-chat-messages/:roomId",
    Authenticator.companyAuthenticator,
    AccessControl.isCompanyBlocked,
    (req: Request, res: Response) => companyController.getChatMessages(req, res))
router.post("/send-message/:companyId/:userId",
    Authenticator.companyAuthenticator,
    AccessControl.isCompanyBlocked,
    (req: Request, res: Response) => companyController.onSendMessage(req, res))


////   Notification   ////
// router.get("/get-notifications/:companyId", (req: Request, res: Response) => companyController.getNotifications(req, res))
router.get("/get-notifications/:id",
    Authenticator.companyAuthenticator,
    AccessControl.isCompanyBlocked,
    (req: Request, res: Response) => notificationController.getNotifications(req, res))
router.post("/update-notifications",
    Authenticator.companyAuthenticator,
    AccessControl.isCompanyBlocked,
    (req: Request, res: Response) => notificationController.updateNotifications(req, res))
router.delete("/delete-notification/:roomId/:id",
    Authenticator.companyAuthenticator,
    AccessControl.isCompanyBlocked,
    (req: Request, res: Response) => notificationController.deleteNotifications(req, res))


//Dashboard :

router.get("/get-dashboard-data/:companyId",
    Authenticator.companyAuthenticator,
    AccessControl.isCompanyBlocked,
    (req: Request, res: Response) => companyController.getDashboardData(req, res))
router.get("/get-monthly-revenue/:companyId",
    Authenticator.companyAuthenticator,
    AccessControl.isCompanyBlocked,
    (req: Request, res: Response) => companyController.getMonthlyRevenue(req, res))
router.get("/get-revenue-by-range/:companyId",
    Authenticator.companyAuthenticator,
    AccessControl.isCompanyBlocked,
    (req: Request, res: Response) => companyController.getRevenueByRange(req, res))
router.get("/get-turf-overallRevenue/:companyId/:turfId",
    Authenticator.companyAuthenticator,
    AccessControl.isCompanyBlocked,
    (req: Request, res: Response) => companyController.getRevenuesByTurf(req, res))



//// Sales Report ///// 
router.get("/get-lastmonth-revenue/:companyId",
    Authenticator.companyAuthenticator,
    AccessControl.isCompanyBlocked,
    (req: Request, res: Response) => companyController.getLastMonthRevenues(req, res))
router.get("/get-revenues-by-interval/:companyId",
    Authenticator.companyAuthenticator,
    AccessControl.isCompanyBlocked,
    (req: Request, res: Response) => companyController.getRevenuesByInterval(req, res))

export { router as companyRoute }
