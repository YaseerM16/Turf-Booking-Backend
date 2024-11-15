import express, { Request, Response, Router } from "express";
import { UserController as AppUserController } from "../../app/controllers/UserController";
import { MongoUserRepository } from "../../infrastructure/database/MongoUserRepository";
import { UserUseCase } from "../../domain/useCases/UserUseCases";
UserUseCase


const router: Router = express.Router()

const userRepository = new MongoUserRepository()
const userUseCase = new UserUseCase(userRepository)
const userController = new AppUserController(userUseCase)

router.post("/signup", (req: Request, res: Response) => userController.registersUser(req, res))

export { router as userRoute }