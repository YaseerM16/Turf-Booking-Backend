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

    async updateDetails(req: Request, res: Response): Promise<void> {
        try {
            const { companyId } = req.params

            const company = await this.companyUseCase.updateProfileDetails(companyId, req.body)
            if (!company) {
                res.status(404).json({ success: false, message: "User not found or update failed" });
                return
            }

            res.status(200).send({ success: true, company });
            return

        } catch (error) {
            res.status(500).json({ message: "Internal server error" });
        }
    }

    async updateProfileImage(
        req: Request,
        res: Response,
    ): Promise<void> {
        try {
            const { companyId } = req.params
            const imageUrl = (req.files as any)?.profileImage?.[0].location
            if (!imageUrl) {
                res.status(400).send("Profile image is required");
            }
            const company = await this.companyUseCase.updateProfileImage(companyId, imageUrl);
            res.status(200).send({ success: true, company });

        } catch (error) {
            res.status(403).json({ message: (error as Error).message });
        }
    }

    async getTurfs(req: Request, res: Response) {
        try {

            const { companyId } = req.query
            if (!companyId) res.status(400).json({ success: false, message: "Cannot get the Company Id :" });

            const turfs = await this.companyUseCase.getTurfs(companyId as string)
            res.status(200).json({ success: true, turfs, message: "Turfs Fetched successfully :" });

        } catch (error) {
            console.error('Error during Register Turf:', error);
            res.status(500).json({ message: 'Something went wrong during Fetch the Turfs :', error: error });
        }
    }

    async blockTurf(req: Request, res: Response) {
        try {
            const { turfId } = req.query
            if (!turfId) res.status(400).json({ success: false, message: "Cannot get the Company Id :" });

            const isBlocked = await this.companyUseCase.blockTurf(turfId as string)
            res.status(200).json({ success: true, isBlocked, message: "Turfs Fetched successfully :" });
        } catch (error) {
            console.error('Error Block the Turf:', error);
            res.status(500).json({ message: 'Something went wrong during Block the Turf :', error: error });
        }
    }
    async unBlockTurf(req: Request, res: Response) {
        try {
            const { turfId } = req.query
            if (!turfId) res.status(400).json({ success: false, message: "Cannot get the Company Id :" });

            const isBlocked = await this.companyUseCase.unBlockTurf(turfId as string)
            res.status(200).json({ success: true, isBlocked, message: "Turfs Fetched successfully :" });
        } catch (error) {
            console.error('Error Block the Turf:', error);
            res.status(500).json({ message: 'Something went wrong during Block the Turf :', error: error });
        }
    }

    async getTurfDetails(req: Request, res: Response) {
        try {

            const { turfId } = req.query
            if (!turfId) res.status(200).json({ success: false, message: "Cannot get the Turf Id :" });

            const getTurf = await this.companyUseCase.getTurfById(turfId as string)
            res.status(200).json({ success: true, turf: getTurf, message: "Turf Fetched successfully :" });

        } catch (error) {
            console.error('Error during getting Turf Details :', error);
            res.status(500).json({ message: 'Something went wrong during Fetch the Turf Details :', error: error });
        }
    }

    async deleteTurfImage(req: Request, res: Response) {
        try {
            const { turfId, index } = req.body

            if (!turfId || index === undefined || index === null) {
                res.status(500).json({ success: false, message: "Cannot get the Turf Id or Index values :" });
                return
            }

            const resultArr = await this.companyUseCase.deleteTurfImage(turfId, index)
            res.status(200).json({ success: true, images: resultArr, message: "Turf Image Deleted successfully :" });

        } catch (error) {
            console.error('Error during delete Turf Image :', error);
            res.status(500).json({ message: 'Something went wrong during Deleting the Turf Image :', error: error });
        }
    }

    async editTurf(req: Request, res: Response) {
        try {

            const images = (req.files as any)?.TurfImages
            let locations: string[] | undefined;

            if (images && images.length > 0) {
                locations = images.map((image: any) => image.location);
            }

            const isUpdated = await this.companyUseCase.editTurf({ ...req.body, ...(locations && { images: locations }) })

            if (isUpdated) res.status(200).json({ success: true, turf: isUpdated });

        } catch (error) {
            console.error('Error during Edit Turf Details :', error);
            res.status(500).json({ message: 'Something went wrong during Edit the Turf Details :', error: error });
        }
    }

    async getSlots(req: Request, res: Response) {
        try {
            const { turfId, day } = req.query

            const slots = await this.companyUseCase.getSlotsByDay(turfId as string, day as string)
            res.status(200).json({ success: true, slots, message: "Turf Slots by Day Fetched successfully :" });

        } catch (error: any) {
            res.status(500).json({ message: error?.message });
        }
    }

    async makeSlotUnavail(req: Request, res: Response) {
        try {
            const { slotId, turfId } = req.query

            const isUnavailed: any = await this.companyUseCase.makeSlotUnavail(slotId as string, turfId as string)
            if (isUnavailed.success) {
                res.status(200).json({ success: true, result: isUnavailed, message: "Slot Unavailed successfully :" });
            }
            // console.log("From the makeSlotUnavail :", slotId, turfId);

        } catch (error: any) {
            res.status(500).json({ message: error?.message });
        }
    }

    async makeSlotAvail(req: Request, res: Response) {
        try {
            const { slotId, turfId } = req.query

            const isAvailed: any = await this.companyUseCase.makeSlotAvail(slotId as string, turfId as string)
            if (isAvailed.success) {
                res.status(200).json({ success: true, result: isAvailed, message: "Slot Unavailed successfully :" });
            }
            // console.log("From the makeSlotUnavail :", slotId, turfId);

        } catch (error: any) {
            res.status(500).json({ message: error?.message });
        }
    }

}


