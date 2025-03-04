"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.companyRoute = void 0;
const express_1 = __importDefault(require("express"));
const CompanyController_1 = require("../controllers/CompanyController");
const CompanyRepository_1 = require("../../infrastructure/database/repositories/CompanyRepository");
const CompanyUseCase_1 = require("../../domain/useCases/CompanyUseCase");
const AuthService_1 = require("../../infrastructure/services/AuthService");
const EmailService_1 = require("../../infrastructure/services/EmailService");
const multerConfig_1 = require("../../infrastructure/multer/multerConfig");
const Authenticator_1 = __importDefault(require("../../infrastructure/middleware/Authenticator"));
const AccessControl_1 = __importDefault(require("../../infrastructure/middleware/AccessControl"));
const UserRepository_1 = require("../../infrastructure/database/repositories/UserRepository");
const NotificationRepository_1 = require("../../infrastructure/database/repositories/NotificationRepository");
const NotificationModel_1 = __importDefault(require("../../infrastructure/database/models/NotificationModel"));
const NotificationUseCase_1 = require("../../domain/useCases/NotificationUseCase");
const NotificationController_1 = require("../controllers/NotificationController");
const router = express_1.default.Router();
exports.companyRoute = router;
const companyRepository = new CompanyRepository_1.CompanyRepository();
const userRepository = new UserRepository_1.MongoUserRepository();
const emailService = new EmailService_1.MailService(companyRepository, userRepository);
const companyUseCase = new CompanyUseCase_1.CompanyUseCase(companyRepository, emailService);
const authService = new AuthService_1.AuthService();
const companyController = new CompanyController_1.CompanyController(companyUseCase, authService);
const notificationRepo = new NotificationRepository_1.NotificationRepository(NotificationModel_1.default);
const notificationUseCase = new NotificationUseCase_1.NotificationUseCase(notificationRepo);
const notificationController = new NotificationController_1.NotificationController(notificationUseCase);
//Authentication
router.post("/auth/register", (req, res) => companyController.registerCompany(req, res));
router.get("/auth/verifymail", (req, res) => companyController.verifyAccount(req, res));
router.post("/auth/login", (req, res) => companyController.companyLogin(req, res));
router.post("/auth/forgot-password", (req, res) => companyController.forgotPassword(req, res));
router.post("/auth/update-password", (req, res) => companyController.passwordUpdate(req, res));
router.get("/logout", (req, res) => companyController.logout(req, res));
//Profile
router.patch("/profile/upload-image/:companyId", Authenticator_1.default.companyAuthenticator, AccessControl_1.default.isCompanyBlocked, multerConfig_1.uploadMiddleware, (req, res) => companyController.updateProfileImage(req, res));
router.patch("/profile/update-details/:companyId", Authenticator_1.default.companyAuthenticator, AccessControl_1.default.isCompanyBlocked, (req, res) => companyController.updateDetails(req, res));
//Turf-Management
router.post("/register-turf", Authenticator_1.default.companyAuthenticator, AccessControl_1.default.isCompanyBlocked, multerConfig_1.uploadMiddleware, (req, res) => companyController.registerTurf(req, res));
router.get("/get-turfs", Authenticator_1.default.companyAuthenticator, AccessControl_1.default.isCompanyBlocked, (req, res) => companyController.getTurfs(req, res));
router.get("/get-turf-details/:companyId/:turfId", Authenticator_1.default.companyAuthenticator, AccessControl_1.default.isCompanyBlocked, (req, res) => companyController.getTurfDetails(req, res));
router.delete("/delete-turf-image/:turfId/:index", Authenticator_1.default.companyAuthenticator, AccessControl_1.default.isCompanyBlocked, (req, res) => companyController.deleteTurfImage(req, res));
router.put("/edit-turf", multerConfig_1.uploadMiddleware, Authenticator_1.default.companyAuthenticator, AccessControl_1.default.isCompanyBlocked, (req, res) => companyController.editTurf(req, res));
router.patch("/block-turf", Authenticator_1.default.companyAuthenticator, AccessControl_1.default.isCompanyBlocked, (req, res) => companyController.blockTurf(req, res));
router.patch("/Un-block-turf", Authenticator_1.default.companyAuthenticator, AccessControl_1.default.isCompanyBlocked, (req, res) => companyController.unBlockTurf(req, res));
//Slot-Management
router.get("/get-slots-by-day", Authenticator_1.default.companyAuthenticator, AccessControl_1.default.isCompanyBlocked, (req, res) => companyController.getSlots(req, res));
router.get("/make-slot-unavailable", Authenticator_1.default.companyAuthenticator, AccessControl_1.default.isCompanyBlocked, (req, res) => companyController.makeSlotUnavail(req, res));
router.get("/make-slot-available", Authenticator_1.default.companyAuthenticator, AccessControl_1.default.isCompanyBlocked, (req, res) => companyController.makeSlotAvail(req, res));
router.patch("/:turfId/add-working-days", Authenticator_1.default.companyAuthenticator, AccessControl_1.default.isCompanyBlocked, (req, res) => companyController.addWorkingDays(req, res));
router.get("/get-details-by-day/:turfId/:day", Authenticator_1.default.companyAuthenticator, AccessControl_1.default.isCompanyBlocked, (req, res) => companyController.getDetailsOfDay(req, res));
router.patch("/edit-day-details/:turfId", Authenticator_1.default.companyAuthenticator, AccessControl_1.default.isCompanyBlocked, (req, res) => companyController.editWorkingDayDetails(req, res));
// router.get("/example-gen-slots/:turfId", (req: Request, res: Response) => companyController.genExampleOneDay(req, res))
////////// CHAT ////////////////
router.post("/create-chat-room/:companyId/:userId", Authenticator_1.default.companyAuthenticator, AccessControl_1.default.isCompanyBlocked, (req, res) => companyController.createChatRoom(req, res));
router.get("/get-chat-lists/:companyId", Authenticator_1.default.companyAuthenticator, AccessControl_1.default.isCompanyBlocked, (req, res) => companyController.getChatLists(req, res));
router.get("/get-chat-messages/:roomId", Authenticator_1.default.companyAuthenticator, AccessControl_1.default.isCompanyBlocked, (req, res) => companyController.getChatMessages(req, res));
router.post("/send-message/:companyId/:userId", Authenticator_1.default.companyAuthenticator, AccessControl_1.default.isCompanyBlocked, (req, res) => companyController.onSendMessage(req, res));
////   Notification   ////
// router.get("/get-notifications/:companyId", (req: Request, res: Response) => companyController.getNotifications(req, res))
router.get("/get-notifications/:id", Authenticator_1.default.companyAuthenticator, AccessControl_1.default.isCompanyBlocked, (req, res) => notificationController.getNotifications(req, res));
router.post("/update-notifications", Authenticator_1.default.companyAuthenticator, AccessControl_1.default.isCompanyBlocked, (req, res) => notificationController.updateNotifications(req, res));
router.delete("/delete-notification/:roomId/:id", Authenticator_1.default.companyAuthenticator, AccessControl_1.default.isCompanyBlocked, (req, res) => notificationController.deleteNotifications(req, res));
//Dashboard :
router.get("/get-dashboard-data/:companyId", Authenticator_1.default.companyAuthenticator, AccessControl_1.default.isCompanyBlocked, (req, res) => companyController.getDashboardData(req, res));
router.get("/get-monthly-revenue/:companyId", Authenticator_1.default.companyAuthenticator, AccessControl_1.default.isCompanyBlocked, (req, res) => companyController.getMonthlyRevenue(req, res));
router.get("/get-revenue-by-range/:companyId", Authenticator_1.default.companyAuthenticator, AccessControl_1.default.isCompanyBlocked, (req, res) => companyController.getRevenueByRange(req, res));
router.get("/get-turf-overallRevenue/:companyId/:turfId", Authenticator_1.default.companyAuthenticator, AccessControl_1.default.isCompanyBlocked, (req, res) => companyController.getRevenuesByTurf(req, res));
//// Sales Report ///// 
router.get("/get-lastmonth-revenue/:companyId", Authenticator_1.default.companyAuthenticator, AccessControl_1.default.isCompanyBlocked, (req, res) => companyController.getLastMonthRevenues(req, res));
router.get("/get-revenues-by-interval/:companyId", Authenticator_1.default.companyAuthenticator, AccessControl_1.default.isCompanyBlocked, (req, res) => companyController.getRevenuesByInterval(req, res));
