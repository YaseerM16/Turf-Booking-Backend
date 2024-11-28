import e, { NextFunction, Request, Response } from "express";
import { IAdminUseCase } from "../interfaces/usecases/admin/IAdminUseCase";
import { validationResult } from "express-validator";
import { ErrorResponse } from "../../utils/errors";
import { Admin } from "../../domain/entities/Admin";
import { IAuthService } from "../interfaces/services/IAuthService";
import { config } from "../../config/config";


export class AdminController {
    constructor(private adminUseCase: IAdminUseCase, private authService: IAuthService) { }

    async adminLogin(req: Request, res: Response) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                throw new ErrorResponse("Invalid email or password", 401);
            }

            const { email, password } = req.body

            const admin: any = await this.adminUseCase.adminLogin(email, password)

            if (admin.verified) {
                const det: any = {
                    email: admin.email,
                    userRole: "admin"
                };
                const token = this.authService.generateToken(det);
                const refreshToken = this.authService.generateRefreshToken(det)

                res.cookie("refreshToken", refreshToken, {
                    httpOnly: true,
                    secure: config.MODE !== "development",
                    sameSite: "lax"
                });

                res.cookie("token", token, {
                    httpOnly: false,
                    secure: false,
                    sameSite: "lax",
                });

                res
                    .status(200)
                    .json({ success: true, message: "Logged In successfully", loggedIn: true });
            } else {
                res
                    .status(501)
                    .json({ success: false, message: "Not Authenticated !", loggedIn: false });
            }

        } catch (error) {
            res.status(400).json({ message: (error as Error).message });
        }
    }


    async getUsers(req: Request, res: Response) {
        try {
            const page = parseInt(req.query.page as string) || 1; // Default to page 1 if not provided
            const limit = parseInt(req.query.limit as string) || 10;

            const users = await this.adminUseCase.getUsers(page, limit);

            res.status(200).json({ users: users.users, success: true, message: "Fetched Users successfully ", totalUsers: users.totalUsers });
        } catch (error) {
            res.status(400).json({ message: (error as Error).message });
        }
    }

    async userToggleBlock(req: Request, res: Response) {
        try {
            const { email, userId } = req.query

            if (!email) {
                throw new Error("Email is required but was not provided.");
            }

            const user = await this.adminUseCase.isBlocked(email as string, userId as string)

            res.status(200).json({ success: true, message: "User Block Toggled Successfully" });

        } catch (error) {
            res.status(400).json({ message: (error as Error).message });
        }
    }

    async getRegisteredCompany(req: Request, res: Response) {
        try {

            const page = parseInt(req.query.page as string) || 1; // Default to page 1 if not provided
            const limit = parseInt(req.query.limit as string) || 10;

            const companies = await this.adminUseCase.getRegisteredCompanies(page, limit);

            res.status(200).json({ companies: companies.companies, success: true, message: "Fetched Users successfully ", totalCompany: companies.totalCompanies });


        } catch (error) {
            res.status(500).json({ message: 'Something went wrong during Fetch Verified Companies :' });
        }
    }

    async logout(req: Request, res: Response) {
        try {
            res.clearCookie('token');
            res.clearCookie('refreshToken');

            res.status(200).json({ message: 'Logged out successfully', loggedOut: true });

        } catch (error) {
            console.error('Error during logout:', error);
            res.status(500).json({ message: 'Something went wrong during logout' });
        }
    };


}