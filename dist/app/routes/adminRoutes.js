"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminRoute = void 0;
const express_1 = __importDefault(require("express"));
const AdminController_1 = require("../controllers/AdminController");
const AdminUseCase_1 = require("../../domain/useCases/AdminUseCase");
const SubscriptionPlanUseCase_1 = require("../../domain/useCases/SubscriptionPlanUseCase");
const AuthService_1 = require("../../infrastructure/services/AuthService");
const AdminRepository_1 = require("../../infrastructure/database/repositories/AdminRepository");
const SubscriptionPlan_Repository_1 = require("../../infrastructure/database/repositories/SubscriptionPlan.Repository ");
const Authenticator_1 = __importDefault(require("../../infrastructure/middleware/Authenticator"));
const AddSubscription_Validator_1 = require("../../infrastructure/middleware/validation/AddSubscription.Validator");
const SubscriptionPlanController_1 = require("../controllers/SubscriptionPlanController");
const SubscriptionPlan_1 = require("../../infrastructure/database/models/SubscriptionPlan");
const Subscription_1 = require("../../infrastructure/database/models/Subscription");
const UserModel_1 = __importDefault(require("../../infrastructure/database/models/UserModel"));
const router = express_1.default.Router();
exports.adminRoute = router;
const authService = new AuthService_1.AuthService();
const adminRepository = new AdminRepository_1.AdminRepository();
const adminUseCase = new AdminUseCase_1.AdminUseCase(adminRepository);
const adminController = new AdminController_1.AdminController(adminUseCase, authService);
const subscriptionRepo = new SubscriptionPlan_Repository_1.SubscriptionPlanRepository(SubscriptionPlan_1.SubscriptionPlan, Subscription_1.Subscription, UserModel_1.default);
const subscriptionUseCase = new SubscriptionPlanUseCase_1.SubscriptionPlanUseCase(subscriptionRepo);
const subscriptionController = new SubscriptionPlanController_1.SubscriptionPlanController(subscriptionUseCase);
// Admin
router.post("/auth/admin-login", (req, res) => adminController.adminLogin(req, res));
router.get("/logout", (req, res) => adminController.logout(req, res));
// User - Management
router.get("/get-users", Authenticator_1.default.adminAuthenticator, (req, res) => adminController.getUsers(req, res));
router.get("/user-toggle-block/:userId/:email", Authenticator_1.default.adminAuthenticator, (req, res) => adminController.userToggleBlock(req, res));
// Company - Management
router.patch("/approve-company", Authenticator_1.default.adminAuthenticator, (req, res) => adminController.approveCompany(req, res));
router.get("/get-registered-companies", Authenticator_1.default.adminAuthenticator, (req, res) => adminController.getRegisteredCompany(req, res));
router.get("/get-approved-companies", Authenticator_1.default.adminAuthenticator, (req, res) => adminController.getApprovedCompany(req, res));
router.get("/company-toggle-block", Authenticator_1.default.adminAuthenticator, (req, res) => adminController.companyToggleBlock(req, res));
// Dashboard
router.get("/get-dashboard-data", Authenticator_1.default.adminAuthenticator, (req, res) => adminController.getDashboardData(req, res));
router.get("/get-monthly-revenues", Authenticator_1.default.adminAuthenticator, (req, res) => adminController.getMonthlyRevenues(req, res));
router.get("/get-revenues-by-range", Authenticator_1.default.adminAuthenticator, (req, res) => adminController.getRevenuesByRange(req, res));
//Subscription
router.post("/add-subscription-plan", Authenticator_1.default.adminAuthenticator, AddSubscription_Validator_1.validateAddSubscription, (req, res) => subscriptionController.createPlan(req, res));
router.get("/get-subscription-plans", Authenticator_1.default.adminAuthenticator, (req, res) => subscriptionController.getAllPlans(req, res));
router.patch("/edit-subscription-plan/:id", Authenticator_1.default.adminAuthenticator, AddSubscription_Validator_1.validateAddSubscription, (req, res) => subscriptionController.updatePlan(req, res));
router.delete("/delete-subscription-plan/:id", Authenticator_1.default.adminAuthenticator, (req, res) => subscriptionController.deletePlan(req, res));
// router.get("/")
// /Sales Report/ //
router.get("/get-lastMonth-revenues", Authenticator_1.default.adminAuthenticator, (req, res) => adminController.getLastMonthRevenues(req, res));
router.get("/get-revenues-by-date-range", Authenticator_1.default.adminAuthenticator, (req, res) => adminController.getRevenuesByDateRage(req, res));
