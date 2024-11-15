import { Request, Response } from "express";
// import { RegisterUser } from "../../domain/useCases/RegisterUser";
import { UserUseCase } from "../../domain/useCases/UserUseCases";
// UserUseCase

export class UserController {
    constructor(private userUseCase: UserUseCase) { }

    async registersUser(req: Request, res: Response): Promise<void> {
        try {
            const user = await this.userUseCase.RegisterUser(req.body)
            res.status(201).json(user);
        } catch (error) {
            res.status(400).json({ message: (error as Error).message });
        }
    }
}