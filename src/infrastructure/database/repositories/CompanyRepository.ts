import { Company } from "../../../domain/entities/Company";
import { Turf } from "../../../domain/entities/Turf";
import { ICompanyRepository } from "../../../domain/repositories/ICompanyRepository";
import { ErrorResponse } from "../../../utils/errors";
import CompanyModel from "../models/CompanyModel";
import TurfModel from "../models/TurfModel";
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
    async registerTurf(turf: Turf): Promise<Turf | null> {
        try {
            const newTurf = new TurfModel(turf)
            const savedTurf = await newTurf.save();
            return savedTurf as unknown as Turf
        } catch (error: any) {
            throw new ErrorResponse(error.message, error.status);
        }
    }

    async getTurfs(companyId: string): Promise<Turf[] | null> {
        try {
            if (!companyId) throw new ErrorResponse("CompanyId is not Provided :", 500);

            const turfs = await TurfModel.find({ companyId })

            return turfs as unknown as Turf[]
        } catch (error: any) {
            throw new ErrorResponse(error.message, error.status);
        }
    }
} 