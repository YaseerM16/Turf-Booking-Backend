import express, { Request, Response, Router } from "express";
import { UserController as AppUserController } from "../../app/controllers/UserController";
import { MongoUserRepository } from "../../infrastructure/database/repositories/UserRepository";
import { CompanyRepository } from "../../infrastructure/database/repositories/CompanyRepository";
import { UserUseCase } from "../../domain/useCases/UserUseCases";
import { MailService } from "../../infrastructure/services/EmailService";
import { AuthService } from "../../infrastructure/services/AuthService";
import { uploadMiddleware } from "../../infrastructure/multer/multerConfig";
import Authenticator from "../../infrastructure/middleware/Authenticator";
import AccessControl from "../../infrastructure/middleware/AccessControl";
import { validateSignup } from "../../infrastructure/middleware/validation/Signup.Validator";
import { validateLogin } from "../../infrastructure/middleware/validation/Login.Validator";
import { IUserRepository } from "../../domain/repositories/IUserRepository"
import { IEmailService } from "../../app/interfaces/services/IEmailService";
import { IUserUseCase } from "../../app/interfaces/usecases/user/IUserUseCase";
import { IAuthService } from "../../app/interfaces/services/IAuthService";
import { ICompanyRepository } from "../../domain/repositories/ICompanyRepository";
import { NotificationUseCase } from "../../domain/useCases/NotificationUseCase";
import { NotificationRepository } from "../../infrastructure/database/repositories/NotificationRepository";
import { NotificationController } from "../controllers/NotificationController";
import NotificationModel from "../../infrastructure/database/models/NotificationModel";
import { SubscriptionPlanRepository } from "../../infrastructure/database/repositories/SubscriptionPlan.Repository ";
import { SubscriptionPlan } from "../../infrastructure/database/models/SubscriptionPlan";
import { SubscriptionPlanUseCase } from "../../domain/useCases/SubscriptionPlanUseCase";
import { SubscriptionPlanController } from "../controllers/SubscriptionPlanController";
import { Subscription } from "../../infrastructure/database/models/Subscription";


const router: Router = express.Router()

const userRepository: IUserRepository = new MongoUserRepository()
const companyRepository: ICompanyRepository = new CompanyRepository()
const emailService: IEmailService = new MailService(companyRepository, userRepository,)
const userUseCase: IUserUseCase = new UserUseCase(userRepository, emailService)
const authService: IAuthService = new AuthService()
const userController = new AppUserController(userUseCase, authService)

const notificationRepo = new NotificationRepository(NotificationModel)
const notificationUseCase = new NotificationUseCase(notificationRepo)
const notificationController = new NotificationController(notificationUseCase)

const subscriptionRepo = new SubscriptionPlanRepository(SubscriptionPlan, Subscription)
const subscriptionUseCase = new SubscriptionPlanUseCase(subscriptionRepo)
const subscriptionController = new SubscriptionPlanController(subscriptionUseCase)

///  Authentication   ///
router.post("/auth/signup", validateSignup, (req: Request, res: Response) => userController.registersUser(req, res))
router.get("/auth/verifyemail", (req: Request, res: Response) => userController.verifyAccount(req, res))
router.post("/auth/forgot-password", (req: Request, res: Response) => userController.forgotPassword(req, res))
router.post("/auth/update-password", (req: Request, res: Response) => userController.passwordUpdate(req, res))
router.get("/logout", (req: Request, res: Response) => userController.logout(req, res))
router.post("/auth/login",
    validateLogin,
    (req: Request, res: Response) => userController.userLogin(req, res)
)
router.post("/auth/google-sign-up", (req: Request, res: Response) => userController.googleSingUp(req, res))
router.post("/auth/google-login", (req: Request, res: Response) => userController.googleLogin(req, res))


///   Profile   ///
router.patch(
    "/profile/update-details/:userId",
    Authenticator.userAuthenticator,
    AccessControl.isUserBlocked,
    (req: Request, res: Response) => userController.updateDetails(req, res)
)
router.patch(
    "/profile/upload-image/:userId",
    Authenticator.userAuthenticator,
    AccessControl.isUserBlocked,
    uploadMiddleware,
    (req: Request, res: Response) => userController.updateProfileImage(req, res)
);

router.post("/get-verification-mail/:userId",
    Authenticator.userAuthenticator,
    AccessControl.isUserBlocked,
    (req: Request, res: Response) => userController.getVerificationMail(req, res))

///   Guest experience   ///

router.get("/get-turfs", (req: Request, res: Response) => userController.getTurfs(req, res))
router.get("/get-turf-details/:turfId", (req: Request, res: Response) => userController.getTurfDetails(req, res))
router.get("/get-slots-by-day", (req: Request, res: Response) => userController.getSlots(req, res))


///   Booking Slots   ///
router.post("/payment/hashing",
    Authenticator.userAuthenticator,
    AccessControl.isUserBlocked,
    (req: Request, res: Response) => userController.getPaymentHash(req, res))
router.post("/payment/save-booking",
    Authenticator.userAuthenticator,
    AccessControl.isUserBlocked,
    (req: Request, res: Response) => userController.saveBooking(req, res))
router.get("/my-booking",
    Authenticator.userAuthenticator,
    AccessControl.isUserBlocked,
    (req: Request, res: Response) => userController.getBookings(req, res))
router.delete("/booking/cancel/:userId/:slotId/:bookingId",
    (req: Request, res: Response) => userController.cancelSlot(req, res))


// router.put("/gen-slots")



///   Wallet   ///
router.get("/my-wallet/:userId",
    Authenticator.userAuthenticator,
    AccessControl.isUserBlocked,
    (req: Request, res: Response) => userController.myWallet(req, res))
router.get("/wallet/check-balance/:userId", (req: Request, res: Response) => userController.checkWalletBalance(req, res))
router.post("/book-slots-by-wallet/:userId", (req: Request, res: Response) => userController.bookSlotsByWallet(req, res))



////    Chat    ////

router.post("/create-chat-room/:userId/:companyId",
    Authenticator.userAuthenticator,
    AccessControl.isUserBlocked,
    (req: Request, res: Response) => userController.createChatRoom(req, res))
router.post("/send-message/:userId/:companyId",
    Authenticator.userAuthenticator,
    AccessControl.isUserBlocked,
    (req: Request, res: Response) => userController.onSendMessage(req, res))
router.get("/get-messages/:roomId",
    Authenticator.userAuthenticator,
    AccessControl.isUserBlocked,
    (req: Request, res: Response) => userController.getMessages(req, res))
router.get("/get-chats/:userId",
    Authenticator.userAuthenticator,
    AccessControl.isUserBlocked,
    (req: Request, res: Response) => userController.getChats(req, res))
router.patch("/delete-for-everyone/:messageId",
    Authenticator.userAuthenticator,
    AccessControl.isUserBlocked,
    (req: Request, res: Response) => userController.messageDeleteForEveryOne(req, res))
router.patch("/delete-for-me/:messageId",
    Authenticator.userAuthenticator,
    AccessControl.isUserBlocked,
    (req: Request, res: Response) => userController.messageDeleteForMe(req, res))


////   Notification   ////
// router.get("/get-notifications/:userId",
//     Authenticator.userAuthenticator,
//     AccessControl.isUserBlocked,
//     (req: Request, res: Response) => userController.getNotifications(req, res))

router.get(
    "/get-notifications/:id",
    Authenticator.userAuthenticator,
    AccessControl.isUserBlocked,
    (req: Request, res: Response) => notificationController.getNotifications(req, res))

router.post("/update-notifications",
    Authenticator.userAuthenticator,
    AccessControl.isUserBlocked,
    (req: Request, res: Response) => notificationController.updateNotifications(req, res))
router.delete("/delete-notification/:roomId/:id",
    Authenticator.userAuthenticator,
    AccessControl.isUserBlocked,
    (req: Request, res: Response) => notificationController.deleteNotifications(req, res))


//// Subscription //////////
router.get("/get-subscription-plans", (req: Request, res: Response) => subscriptionController.getAllPlans(req, res))
router.post("/subscribe-to-plan/:userId", (req: Request, res: Response) => subscriptionController.subscribeToPlan(req, res))
router.get("/check-for-subscription/:userId", (req: Request, res: Response) => subscriptionController.checkSubscription(req, res))

export { router as userRoute }