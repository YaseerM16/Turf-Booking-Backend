import express, { Request, Response, Router } from "express";
import { UserController as AppUserController } from "../../app/controllers/UserController";
import { MongoUserRepository } from "../../infrastructure/database/repositories/UserRepository";
import { UserUseCase } from "../../domain/useCases/UserUseCases";
import { MailService } from "../../infrastructure/services/EmailService";
import { AuthService } from "../../infrastructure/services/AuthService";
import { uploadMiddleware } from "../../infrastructure/multer/multerConfig";
import { Authenticator } from "../../infrastructure/middleware/Authenticator";
uploadMiddleware
UserUseCase
AuthService

const router: Router = express.Router()

const userRepository = new MongoUserRepository()
const emailService = new MailService(userRepository)
const userUseCase = new UserUseCase(userRepository, emailService)
const authService = new AuthService()
const userController = new AppUserController(userUseCase, authService)

router.post("/auth/signup", (req: Request, res: Response) => userController.registersUser(req, res))
router.post("/auth/login", (req: Request, res: Response) => userController.userLogin(req, res))
router.get("/auth/verifyemail", (req: Request, res: Response) => userController.verifyAccount(req, res))
router.patch(
    "/profile/upload-image/:userId",
    uploadMiddleware.single("profileImage"),
    (req: Request, res: Response) => userController.updateProfileImage(req, res)
);
router.patch("/profile/update-details/:userId", Authenticator, (req: Request, res: Response) => userController.updateDetails(req, res))
router.get("/logout", (req: Request, res: Response) => userController.logout(req, res))
router.post("/auth/forgot-password", (req: Request, res: Response) => userController.forgotPassword(req, res))
router.post("/auth/update-password", (req: Request, res: Response) => userController.passwordUpdate(req, res))

export { router as userRoute }