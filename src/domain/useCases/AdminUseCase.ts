import { IAdminUseCase } from "../../app/interfaces/usecases/admin/IAdminUseCase";
import { config } from "../../config/config";
import { ErrorResponse } from "../../utils/errors";
import { User } from "../entities/User";
import { IAdminRepository } from "../repositories/IAdminRepository";
// import { Admin } from "../entities/Admin";
config



export class AdminUseCase implements IAdminUseCase {
    constructor(private adminRepository: IAdminRepository) { }
    async adminLogin(email: string, password: string): Promise<object | null> {
        try {
            if (!email || !password) {
                throw new Error("Credentials are not email or password are not getting");
            }

            if (email === config.ADMIN_EMAIL && password === config.ADMIN_PASSWORD) {
                return { verified: true, email }
            } else {
                return { verified: false }
            }

        } catch (error: any) {
            throw new ErrorResponse(error.message, error.status);

        }
    }

    async getUsers(page: number, limit: number, searchQry: string): Promise<{ users: any[]; totalUsers: number }> {
        try {
            const users = await this.adminRepository.getAllUsers(page, limit, searchQry);
            const usersData = users.users
            return { users: usersData, totalUsers: users.totalUsers }
        } catch (error: any) {
            throw new ErrorResponse(error.message, error.status);
        }
    }

    async getRegisteredCompanies(page: number, limit: number): Promise<{ companies: any[]; totalCompanies: number }> {
        try {
            const companies = await this.adminRepository.getRegisteredCompany(page, limit)
            const companiesDet = companies.companies
            return { companies: companiesDet, totalCompanies: companies.totalCompany }

        } catch (error: any) {
            throw new ErrorResponse(error.message, error.status);
        }
    }

    async isBlocked(email: string, userId: string): Promise<object> {
        try {
            if (!email) {
                throw new Error("Email is required but was not provided.");
            }

            const users = await this.adminRepository.isBlocked(email, userId);
            if (!users) {
                return { success: false, message: "User not found or error fetching data" };
            }
            return { success: true, message: "User block status fetched successfully" };
        } catch (error: any) {
            throw new ErrorResponse(error.message, error.status);
        }
    }


}