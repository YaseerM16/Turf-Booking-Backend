"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.userRoute = void 0;
const express_1 = __importDefault(require("express"));
const UserController_1 = require("../../app/controllers/UserController");
const UserRepository_1 = require("../../infrastructure/database/repositories/UserRepository");
const CompanyRepository_1 = require("../../infrastructure/database/repositories/CompanyRepository");
const UserUseCases_1 = require("../../domain/useCases/UserUseCases");
const EmailService_1 = require("../../infrastructure/services/EmailService");
const AuthService_1 = require("../../infrastructure/services/AuthService");
const multerConfig_1 = require("../../infrastructure/multer/multerConfig");
const Authenticator_1 = __importDefault(require("../../infrastructure/middleware/Authenticator"));
const AccessControl_1 = __importDefault(require("../../infrastructure/middleware/AccessControl"));
const Signup_Validator_1 = require("../../infrastructure/middleware/validation/Signup.Validator");
const Login_Validator_1 = require("../../infrastructure/middleware/validation/Login.Validator");
const NotificationUseCase_1 = require("../../domain/useCases/NotificationUseCase");
const NotificationRepository_1 = require("../../infrastructure/database/repositories/NotificationRepository");
const NotificationController_1 = require("../controllers/NotificationController");
const NotificationModel_1 = __importDefault(require("../../infrastructure/database/models/NotificationModel"));
const SubscriptionPlan_Repository_1 = require("../../infrastructure/database/repositories/SubscriptionPlan.Repository ");
const SubscriptionPlan_1 = require("../../infrastructure/database/models/SubscriptionPlan");
const SubscriptionPlanUseCase_1 = require("../../domain/useCases/SubscriptionPlanUseCase");
const SubscriptionPlanController_1 = require("../controllers/SubscriptionPlanController");
const Subscription_1 = require("../../infrastructure/database/models/Subscription");
const UserModel_1 = __importDefault(require("../../infrastructure/database/models/UserModel"));
const router = express_1.default.Router();
exports.userRoute = router;
const userRepository = new UserRepository_1.MongoUserRepository();
const companyRepository = new CompanyRepository_1.CompanyRepository();
const emailService = new EmailService_1.MailService(companyRepository, userRepository);
const userUseCase = new UserUseCases_1.UserUseCase(userRepository, emailService);
const authService = new AuthService_1.AuthService();
const userController = new UserController_1.UserController(userUseCase, authService);
const notificationRepo = new NotificationRepository_1.NotificationRepository(NotificationModel_1.default);
const notificationUseCase = new NotificationUseCase_1.NotificationUseCase(notificationRepo);
const notificationController = new NotificationController_1.NotificationController(notificationUseCase);
const subscriptionRepo = new SubscriptionPlan_Repository_1.SubscriptionPlanRepository(SubscriptionPlan_1.SubscriptionPlan, Subscription_1.Subscription, UserModel_1.default);
const subscriptionUseCase = new SubscriptionPlanUseCase_1.SubscriptionPlanUseCase(subscriptionRepo);
const subscriptionController = new SubscriptionPlanController_1.SubscriptionPlanController(subscriptionUseCase);
///  Authentication   ///
router.post("/auth/signup", Signup_Validator_1.validateSignup, (req, res) => userController.registersUser(req, res));
router.get("/auth/verifyemail", (req, res) => userController.verifyAccount(req, res));
router.post("/auth/forgot-password", (req, res) => userController.forgotPassword(req, res));
router.post("/auth/update-password", (req, res) => userController.passwordUpdate(req, res));
router.get("/logout", (req, res) => userController.logout(req, res));
router.post("/auth/login", Login_Validator_1.validateLogin, (req, res) => userController.userLogin(req, res));
router.post("/auth/google-sign-up", (req, res) => userController.googleSingUp(req, res));
router.post("/auth/google-login", (req, res) => userController.googleLogin(req, res));
router.get("/get-top-turfs", (req, res) => userController.getTopTurfs(req, res));
///   Profile   ///
router.patch("/profile/update-details/:userId", Authenticator_1.default.userAuthenticator, AccessControl_1.default.isUserBlocked, (req, res) => userController.updateDetails(req, res));
router.patch("/profile/upload-image/:userId", Authenticator_1.default.userAuthenticator, AccessControl_1.default.isUserBlocked, multerConfig_1.uploadMiddleware, (req, res) => userController.updateProfileImage(req, res));
router.post("/get-verification-mail/:userId", Authenticator_1.default.userAuthenticator, AccessControl_1.default.isUserBlocked, (req, res) => userController.getVerificationMail(req, res));
router.post("/get-preSignedUrl", Authenticator_1.default.userAuthenticator, AccessControl_1.default.isUserBlocked, (req, res) => userController.getSignedUrlController(req, res));
///   Guest experience   ///
router.get("/get-turfs", (req, res) => userController.getTurfs(req, res));
router.get("/get-turf-details/:turfId", (req, res) => userController.getTurfDetails(req, res));
router.get("/get-slots-by-day", (req, res) => userController.getSlots(req, res));
///   Booking Slots   ///
router.post("/payment/hashing", Authenticator_1.default.userAuthenticator, AccessControl_1.default.isUserBlocked, (req, res) => userController.getPaymentHash(req, res));
router.post("/payment/save-booking", Authenticator_1.default.userAuthenticator, AccessControl_1.default.isUserBlocked, (req, res) => userController.saveBooking(req, res));
router.get("/my-booking", Authenticator_1.default.userAuthenticator, AccessControl_1.default.isUserBlocked, (req, res) => userController.getBookings(req, res));
router.delete("/booking/cancel/:userId/:slotId/:bookingId", (req, res) => userController.cancelSlot(req, res));
router.post("/check-slots-availability", Authenticator_1.default.userAuthenticator, AccessControl_1.default.isUserBlocked, (req, res) => userController.confirmSlotAvail(req, res));
// router.put("/gen-slots")
///   Wallet   ///
router.get("/my-wallet/:userId", Authenticator_1.default.userAuthenticator, AccessControl_1.default.isUserBlocked, (req, res) => userController.myWallet(req, res));
router.get("/wallet/check-balance/:userId", (req, res) => userController.checkWalletBalance(req, res));
router.post("/book-slots-by-wallet/:userId", (req, res) => userController.bookSlotsByWallet(req, res));
////    Chat    ////
router.post("/create-chat-room/:userId/:companyId", Authenticator_1.default.userAuthenticator, AccessControl_1.default.isUserBlocked, (req, res) => userController.createChatRoom(req, res));
router.post("/send-message/:userId/:companyId", Authenticator_1.default.userAuthenticator, AccessControl_1.default.isUserBlocked, (req, res) => userController.onSendMessage(req, res));
router.get("/get-messages/:roomId", Authenticator_1.default.userAuthenticator, AccessControl_1.default.isUserBlocked, (req, res) => userController.getMessages(req, res));
router.get("/get-chats/:userId", Authenticator_1.default.userAuthenticator, AccessControl_1.default.isUserBlocked, (req, res) => userController.getChats(req, res));
router.patch("/delete-for-everyone/:messageId", Authenticator_1.default.userAuthenticator, AccessControl_1.default.isUserBlocked, (req, res) => userController.messageDeleteForEveryOne(req, res));
router.patch("/delete-for-me/:messageId", Authenticator_1.default.userAuthenticator, AccessControl_1.default.isUserBlocked, (req, res) => userController.messageDeleteForMe(req, res));
////   Notification   ////
// router.get("/get-notifications/:userId",
//     Authenticator.userAuthenticator,
//     AccessControl.isUserBlocked,
//     (req: Request, res: Response) => userController.getNotifications(req, res))
router.get("/get-notifications/:id", Authenticator_1.default.userAuthenticator, AccessControl_1.default.isUserBlocked, (req, res) => notificationController.getNotifications(req, res));
router.post("/update-notifications", Authenticator_1.default.userAuthenticator, AccessControl_1.default.isUserBlocked, (req, res) => notificationController.updateNotifications(req, res));
router.delete("/delete-notification/:roomId/:id", Authenticator_1.default.userAuthenticator, AccessControl_1.default.isUserBlocked, (req, res) => notificationController.deleteNotifications(req, res));
//// Subscription //////////
router.get("/get-subscription-plans", (req, res) => subscriptionController.getAllPlans(req, res));
router.post("/subscribe-to-plan/:userId", Authenticator_1.default.userAuthenticator, AccessControl_1.default.isUserBlocked, (req, res) => subscriptionController.subscribeToPlan(req, res));
router.get("/check-for-subscription/:userId", Authenticator_1.default.userAuthenticator, AccessControl_1.default.isUserBlocked, (req, res) => subscriptionController.checkSubscription(req, res));
router.post("/subscription/payment/hash", Authenticator_1.default.userAuthenticator, AccessControl_1.default.isUserBlocked, (req, res) => subscriptionController.getPaymentHashSubscription(req, res));
