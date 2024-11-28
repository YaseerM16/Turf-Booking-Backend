import { Company } from "../entities/Company";
import { ICompanyUseCase } from "../../../src/app/interfaces/usecases/company/ICompanyUseCase"
import { ICompanyRepository } from "../repositories/ICompanyRepository";
import { IEmailService } from "../repositories/IEmailService";
import { ErrorResponse } from "../../utils/errors";
import { comparePassword, generateHashPassword } from "../../infrastructure/services/PasswordService";

Company


export class CompanyUseCase implements ICompanyUseCase {

    constructor(private companyRepository: ICompanyRepository, private mailService: IEmailService) { }


    async RegisterCompany(company: Company): Promise<Company> {
        try {
            const existingCompany = await this.companyRepository.findByEmail(company.companyemail)

            if (existingCompany) throw new ErrorResponse("user aldready registered", 400);

            if (company.password) {
                const hashedPassword = await generateHashPassword(company.password);
                company.password = hashedPassword;
            }
            const newCompany = await this.companyRepository.create(company);

            if (!newCompany.googleId) {
                await this.mailService.accountVerifyMail(newCompany, "verifyEmail");
            }

            return newCompany
        } catch (error: any) {
            throw new ErrorResponse(error.message, error.status);

        }

    }
    async verifyMail(type: string, token: string, email: string): Promise<Company | null> {
        try {
            const company = await this.companyRepository.findByEmail(email);

            if (type === "verifyEmail" && company?.verifyTokenExpiry) {
                const date = company.verifyTokenExpiry.getTime();

                if (date < Date.now()) {
                    throw new ErrorResponse("Token expired", 400);
                }

                if (company.verifyToken === token) {
                    const data = {
                        isVerified: true,
                        verifyToken: "",
                        verifyTokenExpiry: "",
                    };

                    let updatedCompany = await this.companyRepository.update(
                        company._id.toString(),
                        data
                    );

                    return updatedCompany;
                } else {
                    throw new ErrorResponse("Invalid verification token", 400);
                }
            } else if (type === "forgotPassword" && company?.forgotPasswordTokenExpiry) {
                const date = company.forgotPasswordTokenExpiry.getTime();

                if (date < Date.now()) {
                    throw new ErrorResponse("Token expired", 400);
                }

                if (company.forgotPasswordToken === token) {
                    const data = {
                        isVerified: true,
                        forgotPasswordToken: "",
                        verifyTokenExforgotPasswordTokenExpirypiry: "",
                    };

                    let updatedCompany = await this.companyRepository.update(
                        company._id.toString(),
                        data
                    );
                    return updatedCompany;
                } else {
                    throw new ErrorResponse("Invalid password reset token", 400);
                }
            }
            return company;
        } catch (error: any) {
            throw new ErrorResponse(error.message, error.status);
        }
    }

    async companyLogin(email: string, password: string): Promise<Company | null> {
        try {
            let company = await this.companyRepository.findByEmail(email);

            if (!company || !company.password) {
                throw new ErrorResponse("user dosen't exist", 404);
            }
            const passwordMatch = await comparePassword(password, company.password);

            if (!passwordMatch) {
                throw new ErrorResponse("password dosen't match", 400);
            }

            if (!company.isActive) {
                throw new ErrorResponse("user is blocked", 404);
            }

            return company;
        } catch (error: any) {
            throw new ErrorResponse(error.message, error.status);
        }
    }

}