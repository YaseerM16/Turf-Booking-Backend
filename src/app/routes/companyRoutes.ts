import express, { Request, Response, Router } from "express";
import { CompanyController } from "../controllers/CompanyController";
import { CompanyRepository } from "../../infrastructure/database/repositories/CompanyRepository";
import { CompanyUseCase } from "../../domain/useCases/CompanyUseCase";
import { AuthService } from "../../infrastructure/services/AuthService";
import { MailService } from "../../infrastructure/services/EmailService";
import { uploadMiddleware } from "../../infrastructure/multer/multerConfig";
import Authenticator from "../../infrastructure/middleware/Authenticator";
import AccessControl from "../../infrastructure/middleware/AccessControl";
uploadMiddleware
CompanyController
CompanyRepository
AccessControl

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
router.post("/register-turf", Authenticator.companyAuthenticator,
    AccessControl.isCompanyBlocked, uploadMiddleware, (req: Request, res: Response) => companyController.registerTurf(req, res))
router.get("/get-turfs", Authenticator.companyAuthenticator,
    AccessControl.isCompanyBlocked, (req: Request, res: Response) => companyController.getTurfs(req, res))
router.get("/get-turf-details", Authenticator.companyAuthenticator,
    AccessControl.isCompanyBlocked, (req: Request, res: Response) => companyController.getTurfDetails(req, res))
router.patch("/delete-turf-image", Authenticator.companyAuthenticator,
    AccessControl.isCompanyBlocked, (req: Request, res: Response) => companyController.deleteTurfImage(req, res))
router.put("/edit-turf", uploadMiddleware, Authenticator.companyAuthenticator,
    AccessControl.isCompanyBlocked, (req: Request, res: Response) => companyController.editTurf(req, res))
router.patch("/block-turf", Authenticator.companyAuthenticator,
    AccessControl.isCompanyBlocked, (req: Request, res: Response) => companyController.blockTurf(req, res))
router.patch("/Un-block-turf", Authenticator.companyAuthenticator,
    AccessControl.isCompanyBlocked, (req: Request, res: Response) => companyController.unBlockTurf(req, res))


//Slot-Management
router.get("/get-slots-by-day", Authenticator.companyAuthenticator,
    AccessControl.isCompanyBlocked, (req: Request, res: Response) => companyController.getSlots(req, res))
router.get("/make-slot-unavailable", Authenticator.companyAuthenticator,
    AccessControl.isCompanyBlocked, (req: Request, res: Response) => companyController.makeSlotUnavail(req, res))
router.get("/make-slot-available", Authenticator.companyAuthenticator,
    AccessControl.isCompanyBlocked, (req: Request, res: Response) => companyController.makeSlotAvail(req, res))
router.patch("/:turfId/add-working-days", Authenticator.companyAuthenticator,
    AccessControl.isCompanyBlocked, (req: Request, res: Response) => companyController.addWorkingDays(req, res))
router.get("/get-details-by-day/:turfId/:day", (req: Request, res: Response) => companyController.getDetailsOfDay(req, res))
router.patch("/edit-day-details/:turfId", (req: Request, res: Response) => companyController.editWorkingDayDetails(req, res))

router.get("/example-gen-slots/:turfId", (req: Request, res: Response) => companyController.genExampleOneDay(req, res))

export { router as companyRoute }
