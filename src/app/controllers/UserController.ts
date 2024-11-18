import { NextFunction, Request, Response } from "express";
import { SendOtp } from "../../domain/useCases/SendOtp";
import { VerifyOtp } from "../../domain/useCases/VerifyOtp";
import { IUserUseCase } from "../usecases/IUserUseCase";
import { IAuthService } from "../interfaces/services/IAuthService";
import { ErrorResponse } from "../../utils/errors";

SendOtp
VerifyOtp

export class UserController {
    constructor(private userUseCase: IUserUseCase, private authService: IAuthService) { }

    async registersUser(req: Request, res: Response): Promise<void> {
        try {
            const user = await this.userUseCase.RegisterUser(req.body)
            const data = {
                _id: user?._id,
                email: user?.email,
                role: user?.role,
            };

            const newUser = {
                ...JSON.parse(JSON.stringify(user)),
                password: undefined,
            };

            const token = this.authService.generateToken(data);
            res.cookie("token", token, {
                httpOnly: true,
                secure: false,
                sameSite: "lax",
            });
            res.status(200).json({ success: true, user: newUser, token });

            // res.status(201).json(user);
        } catch (error) {
            res.status(400).json({ message: (error as Error).message });
        }
    }



    // async verifysOtp(req: Request, res: Response): Promise<void> {
    //     try {
    //         const { email, code } = req.body;
    //         const isValid = await this.verifyOtp.execute(email, code);
    //         res.status(200).json({ message: isValid ? "OTP verified" : "OTP invalid" });
    //     } catch (error) {
    //         res.status(400).json({ message: (error as Error).message });
    //     }
    // }
    async verifyAccount(req: Request, res: Response) {
        try {
            const { type, token, email } = req.query;

            // console.log("req query form verifyAccount :", req.query);


            const data = await this.userUseCase.verifyMail(type as string, token as string, email as string);

            if (data) {
                const user = {
                    ...JSON.parse(JSON.stringify(data)),
                    password: undefined,
                };
                res
                    .status(200)
                    .json({ success: true, message: "account verified", user });
            }
        } catch (error: any) {
            throw new ErrorResponse(error.message, error.status);
        }
    }


}