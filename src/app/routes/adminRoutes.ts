import express, { Request, Response, Router } from "express";
import { AdminController } from "../controllers/AdminController";
import { AdminUseCase } from "../../domain/useCases/AdminUseCase";
import { AuthService } from "../../infrastructure/services/AuthService";
import { AdminRepository } from "../../infrastructure/database/repositories/AdminRepository";
import { Authenticator } from "../../infrastructure/middleware/Authenticator";
AdminController
AdminUseCase
AuthService
AdminRepository
const router: Router = express.Router()


const authService = new AuthService()
const adminRepository = new AdminRepository()
const adminUseCase = new AdminUseCase(adminRepository)
const adminController = new AdminController(adminUseCase, authService)

// Admin
router.post("/auth/admin-login", (req: Request, res: Response) => adminController.adminLogin(req, res))
router.get("/logout", (req: Request, res: Response) => adminController.logout(req, res))

// User - Management
router.get("/get-users", Authenticator, (req: Request, res: Response) => adminController.getUsers(req, res))
router.get("/user-toggle-block", Authenticator, (req: Request, res: Response) => adminController.userToggleBlock(req, res))

// Company - Management
router.patch("/approve-company", Authenticator, (req: Request, res: Response) => adminController.approveCompany(req, res))
router.get("/get-registered-companies", Authenticator, (req: Request, res: Response) => adminController.getRegisteredCompany(req, res))
router.get("/get-approved-companies", Authenticator, (req: Request, res: Response) => adminController.getApprovedCompany(req, res))
router.get("/company-toggle-block", Authenticator, (req: Request, res: Response) => adminController.companyToggleBlock(req, res))


export { router as adminRoute }
