import e, { NextFunction, Request, Response } from "express";

import { ICompanyUseCase } from "../../app/interfaces/usecases/company/ICompanyUseCase"
import { validationResult } from "express-validator"
import { ErrorResponse } from "../../utils/errors";
import { IAuthService } from "../interfaces/services/IAuthService";
import { config } from "../../config/config";
import { Company } from "../../domain/entities/Company";


export class CompanyController {
    constructor(private companyUseCase: ICompanyUseCase, private authService: IAuthService) { }

    async registerCompany(req: Request, res: Response) {
        try {
            const errors = validationResult(req);

            if (!errors.isEmpty()) {
                throw new ErrorResponse("Invalid email or password", 401);
            }

            const company = await this.companyUseCase.RegisterCompany(req.body)

            const newCompany = {
                ...JSON.parse(JSON.stringify(company)),
                password: undefined,
            };

            res.status(200).json({ success: true, user: newCompany });

        } catch (error) {
            res.status(400).json({ message: (error as Error).message });
        }

    }

    async verifyAccount(req: Request, res: Response) {
        try {
            const { type, token, email } = req.query;
            console.log("REq Query :", req.query);

            // console.log("type :", type, "token :", token, "email: ", email);


            const data = await this.companyUseCase.verifyMail(type as string, token as string, email as string);

            if (data) {
                if (type == "verifyEmail") {
                    const company = {
                        ...JSON.parse(JSON.stringify(data)),
                        password: undefined,
                    };
                    const det = {
                        _id: data?._id,
                        email: data?.companyemail,
                        userRole: "company"
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
                        .json({ success: true, message: "account verified", company, token });
                } else if (type == "forgotPassword") {
                    res
                        .status(200)
                        .json({ success: true, message: "account verified", token, forgotMail: true });
                }
            }
        } catch (error: any) {
            res.status(401).json({ message: (error as Error).message });
        }
    }

    async companyLogin(req: Request, res: Response): Promise<void> {
        try {
            const errors = validationResult(req);

            if (!errors.isEmpty()) {
                throw new ErrorResponse("Invalid email or password", 401);
            }
            const { email, password } = req.body
            const company: Company | null = await this.companyUseCase.companyLogin(email, password)
            const companyData = {
                ...JSON.parse(JSON.stringify(company)),
                password: undefined,
            };

            const det: any = {
                _id: company?._id,
                email: company?.companyemail,
                userRole: "company"
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
                .json({ success: true, message: "Logged In successfully", company: companyData, loggedIn: true });


        } catch (error: any) {
            res.status(401).json({ message: (error as Error).message });
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

    async registerTurf(req: Request, res: Response) {
        try {

            const images = (req.files as any)?.TurfImages
            const locations = images.map((image: any) => image.location);

            const isRegistered = await this.companyUseCase.registerTurf({ ...req.body, images: locations })

            if (isRegistered) res.status(200).json({ success: true, turf: isRegistered });


        } catch (error) {
            console.error('Error during Register Turf:', error);
            res.status(500).json({ message: 'Something went wrong during Register Turf :', error: error });
        }
    }

    async getTurfs(req: Request, res: Response) {
        try {

            const { companyId } = req.query
            console.log("CompnayId :", companyId);
            if (!companyId) res.status(200).json({ success: false, message: "Cannot get the Company Id :" });

            const turfs = await this.companyUseCase.getTurfs(companyId as string)
            res.status(200).json({ success: true, turfs, message: "Turfs Fetched successfully :" });

        } catch (error) {
            console.error('Error during Register Turf:', error);
            res.status(500).json({ message: 'Something went wrong during Fetch the Turfs :', error: error });
        }
    }

    async getTurfDetails(req: Request, res: Response) {
        try {

            const { turfId } = req.query
            console.log("Turf Id :", turfId);

        } catch (error) {
            console.error('Error during getting Turf Details :', error);
            res.status(500).json({ message: 'Something went wrong during Fetch the Turf Details :', error: error });
        }
    }

}


