import { Company } from "../../../domain/entities/Company";
import { ICompanyRepository } from "../../../domain/repositories/ICompanyRepository";
import { ErrorResponse } from "../../../utils/errors";
import CompanyModel from "../models/CompanyModel";
CompanyModel

Company

export class CompanyRepository implements ICompanyRepository {
    async findByEmail(email: string): Promise<Company | null> {
        try {
            const companyDoc = await CompanyModel.findOne({ companyemail: email })
            return companyDoc ? companyDoc : null
        } catch (error: any) {
            throw new ErrorResponse(error.message, error.status);
        }
    }
    async create(company: Company): Promise<Company> {
        try {
            const companyDoc = new CompanyModel(company)
            await companyDoc.save()
            return companyDoc

        } catch (error: any) {
            throw new ErrorResponse(error.message, error.status);
        }
    }
    async update(id: string, value: any): Promise<Company | null> {
        try {
            const updatedCompany = await CompanyModel.findByIdAndUpdate(id, value, {
                new: true,
                fields: "-password"
            });
            return updatedCompany
        } catch (error: any) {
            throw new ErrorResponse(error.message, error.status);
        }
    }
} 