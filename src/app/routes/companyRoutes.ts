import express, { Request, Response, Router } from "express";
import { CompanyController } from "../controllers/CompanyController";
import { CompanyRepository } from "../../infrastructure/database/repositories/CompanyRepository";
import { CompanyUseCase } from "../../domain/useCases/CompanyUseCase";
import { AuthService } from "../../infrastructure/services/AuthService";
import { MailService } from "../../infrastructure/services/EmailService";
import { uploadMiddleware } from "../../infrastructure/multer/multerConfig";
uploadMiddleware
CompanyController
CompanyRepository

const router: Router = express.Router()


const companyRepository = new CompanyRepository()
const emailService = new MailService(companyRepository)
const companyUseCase = new CompanyUseCase(companyRepository, emailService)
const authService = new AuthService()
const companyController = new CompanyController(companyUseCase, authService)

//Authentication
router.post("/auth/register", (req: Request, res: Response) => companyController.registerCompany(req, res))
router.get("/auth/verifymail", (req: Request, res: Response) => companyController.verifyAccount(req, res))
router.post("/auth/login", (req: Request, res: Response) => companyController.companyLogin(req, res))
router.get("/logout", (req: Request, res: Response) => companyController.logout(req, res))
router.get("/get-turfs", (req: Request, res: Response) => companyController.getTurfs(req, res))
router.get("/get-turf-details", (req: Request, res: Response) => companyController.getTurfDetails(req, res))


//Turf-Management
router.post("/register-turf", uploadMiddleware, (req: Request, res: Response) => companyController.registerTurf(req, res))
router.patch("/delete-turf-image", (req: Request, res: Response) => companyController.deleteTurfImage(req, res))

export { router as companyRoute }
