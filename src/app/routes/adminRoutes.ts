import express, { Request, Response, Router } from "express";
import { AdminController } from "../controllers/AdminController";
import { AdminUseCase } from "../../domain/useCases/AdminUseCase";
import { SubscriptionPlanUseCase } from "../../domain/useCases/SubscriptionPlanUseCase";
import { AuthService } from "../../infrastructure/services/AuthService";
import { AdminRepository } from "../../infrastructure/database/repositories/AdminRepository";
import { SubscriptionPlanRepository } from "../../infrastructure/database/repositories/SubscriptionPlan.Repository ";
import Authenticator from "../../infrastructure/middleware/Authenticator";
import { validateAddSubscription } from "../../infrastructure/middleware/validation/AddSubscription.Validator";
import { SubscriptionPlanController } from "../controllers/SubscriptionPlanController";
import { SubscriptionPlan } from "../../infrastructure/database/models/SubscriptionPlan";
import { Subscription } from "../../infrastructure/database/models/Subscription";
import UserModel from "../../infrastructure/database/models/UserModel";


const router: Router = express.Router()

const authService = new AuthService()
const adminRepository = new AdminRepository()
const adminUseCase = new AdminUseCase(adminRepository)
const adminController = new AdminController(adminUseCase, authService)

const subscriptionRepo = new SubscriptionPlanRepository(SubscriptionPlan, Subscription, UserModel)
const subscriptionUseCase = new SubscriptionPlanUseCase(subscriptionRepo)
const subscriptionController = new SubscriptionPlanController(subscriptionUseCase)

// Admin
router.post("/auth/admin-login", (req: Request, res: Response) => adminController.adminLogin(req, res))
router.get("/logout", (req: Request, res: Response) => adminController.logout(req, res))

// User - Management
router.get("/get-users", Authenticator.adminAuthenticator, (req: Request, res: Response) => adminController.getUsers(req, res))
router.get("/user-toggle-block/:userId/:email", Authenticator.adminAuthenticator, (req: Request, res: Response) => adminController.userToggleBlock(req, res))

// Company - Management
router.patch("/approve-company", Authenticator.adminAuthenticator, (req: Request, res: Response) => adminController.approveCompany(req, res))
router.get("/get-registered-companies", Authenticator.adminAuthenticator, (req: Request, res: Response) => adminController.getRegisteredCompany(req, res))
router.get("/get-approved-companies", Authenticator.adminAuthenticator, (req: Request, res: Response) => adminController.getApprovedCompany(req, res))
router.get("/company-toggle-block", Authenticator.adminAuthenticator, (req: Request, res: Response) => adminController.companyToggleBlock(req, res))

// Dashboard
router.get("/get-dashboard-data", Authenticator.adminAuthenticator, (req: Request, res: Response) => adminController.getDashboardData(req, res))
router.get("/get-monthly-revenues", Authenticator.adminAuthenticator, (req: Request, res: Response) => adminController.getMonthlyRevenues(req, res))
router.get("/get-revenues-by-range", Authenticator.adminAuthenticator, (req: Request, res: Response) => adminController.getRevenuesByRange(req, res))

//Subscription
router.post("/add-subscription-plan", Authenticator.adminAuthenticator, validateAddSubscription, (req: Request, res: Response) => subscriptionController.createPlan(req, res))
router.get("/get-subscription-plans", Authenticator.adminAuthenticator, (req: Request, res: Response) => subscriptionController.getAllPlans(req, res))
router.patch("/edit-subscription-plan/:id", Authenticator.adminAuthenticator, validateAddSubscription, (req: Request, res: Response) => subscriptionController.updatePlan(req, res))
router.delete("/delete-subscription-plan/:id", Authenticator.adminAuthenticator, (req: Request, res: Response) => subscriptionController.deletePlan(req, res))

// router.get("/")
// /Sales Report/ //
router.get("/get-lastMonth-revenues", Authenticator.adminAuthenticator, (req: Request, res: Response) => adminController.getLastMonthRevenues(req, res))
router.get("/get-revenues-by-date-range", Authenticator.adminAuthenticator, (req: Request, res: Response) => adminController.getRevenuesByDateRage(req, res))


export { router as adminRoute }
