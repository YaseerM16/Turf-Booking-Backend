import express, { Request, Response, Router } from "express";
import { AdminController } from "../controllers/AdminController";
import { AdminUseCase } from "../../domain/useCases/AdminUseCase";
import { AuthService } from "../../infrastructure/services/AuthService";
import { AdminRepository } from "../../infrastructure/database/repositories/AdminRepository";
AdminController
AdminUseCase
AuthService
AdminRepository
const router: Router = express.Router()


const authService = new AuthService()
const adminRepository = new AdminRepository()
const adminUseCase = new AdminUseCase(adminRepository)
const adminController = new AdminController(adminUseCase, authService)


router.post("/auth/admin-login", (req: Request, res: Response) => adminController.adminLogin(req, res))
// router.get("/get-registered-companies")
router.get("/get-users", (req: Request, res: Response) => adminController.getUsers(req, res))
router.get("/user-toggle-block", (req: Request, res: Response) => adminController.userToggleBlock(req, res))
router.get("/logout", (req: Request, res: Response) => adminController.logout(req, res))
router.get("/get-registered-companies", (req: Request, res: Response) => adminController.getRegisteredCompany(req, res))
router.patch("/approve-company", (req: Request, res: Response) => adminController.approveCompany(req, res))

export { router as adminRoute }
