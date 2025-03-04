"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.notificationRoute = void 0;
const express_1 = __importDefault(require("express"));
const NotificationController_1 = require("../controllers/NotificationController");
const NotificationUseCase_1 = require("../../domain/useCases/NotificationUseCase");
const NotificationRepository_1 = require("../../infrastructure/database/repositories/NotificationRepository");
const NotificationModel_1 = __importDefault(require("../../infrastructure/database/models/NotificationModel"));
const Authenticator_1 = __importDefault(require("../../infrastructure/middleware/Authenticator"));
const AccessControl_1 = __importDefault(require("../../infrastructure/middleware/AccessControl"));
const router = express_1.default.Router();
exports.notificationRoute = router;
const notificationRepo = new NotificationRepository_1.NotificationRepository(NotificationModel_1.default);
const notificationUseCase = new NotificationUseCase_1.NotificationUseCase(notificationRepo);
const notificationController = new NotificationController_1.NotificationController(notificationUseCase);
router.get("/get-notifications/:id", Authenticator_1.default.userAuthenticator, AccessControl_1.default.isUserBlocked, (req, res) => notificationController.getNotifications(req, res));
