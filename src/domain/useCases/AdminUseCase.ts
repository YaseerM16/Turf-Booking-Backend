import { IAdminUseCase } from "../../app/interfaces/usecases/admin/IAdminUseCase";
import { config } from "../../config/config";
import { StatusCode } from "../../shared/enums/StatusCode";
import { ErrorResponse } from "../../shared/utils/errors";
import { Booking } from "../entities/Booking";
import { Company } from "../entities/Company";
import { SubscriptionPlan } from "../entities/SubscriptionPlan";
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

    async getUsers(page: number, limit: number, searchQry: string, filter: string): Promise<{ users: any[]; totalUsers: number }> {
        try {
            const users = await this.adminRepository.getAllUsers(page, limit, searchQry, filter);
            const usersData = users.users
            return { users: usersData, totalUsers: users.totalUsers }
        } catch (error: any) {
            throw new ErrorResponse(error.message, error.status);
        }
    }

    async getRegisteredCompanies(page: number, limit: number, searchQry: string): Promise<{ companies: any[]; totalCompanies: number }> {
        try {
            const companies = await this.adminRepository.getRegisteredCompany(page, limit, searchQry)
            const companiesDet = companies.companies
            return { companies: companiesDet, totalCompanies: companies.totalCompany }

        } catch (error: any) {
            throw new ErrorResponse(error.message, error.status);
        }
    }

    async getApprovedCompanies(page: number, limit: number, searchQry: string, filter: string): Promise<{ companies: any[]; totalCompanies: number; }> {
        try {
            const companies = await this.adminRepository.getApprovedCompany(page, limit, searchQry, filter)
            const companiesDet = companies.companies
            return { companies: companiesDet, totalCompanies: companies.totalCompany }

        } catch (error: any) {
            throw new ErrorResponse(error.message, error.status);
        }
    }

    async isBlocked(email: string, userId: string): Promise<object> {
        try {
            if (!email || !userId) {
                throw new Error("Email is required but was not provided.");
            }

            const user = await this.adminRepository.isBlocked(email, userId);
            if (!user) {
                return { success: false, message: "User not found or error fetching data" };
            }
            return user
        } catch (error: any) {
            throw new ErrorResponse(error.message, error.status);
        }
    }

    async companyBlockToggle(email: string, companyId: string): Promise<object> {
        try {
            if (!email || !companyId) {
                throw new Error("Email or companyId is required but was not provided.");
            }

            const company = await this.adminRepository.companyBlockToggle(companyId, email);
            if (!company) {
                return { success: false, message: "Company not found or error fetching data" };
            }
            return company

        } catch (error: any) {
            throw new ErrorResponse(error.message, error.status);
        }
    }

    async approveCompany(companyId: string, companyEmail: string): Promise<Company> {
        try {
            if (!companyId || !companyEmail) {
                throw new Error("Credentials(cmpnyId and cmpnyEmail) is required but was not provided.");
            }

            const isApproved = await this.adminRepository.approveTheCompany(companyId, companyEmail)
            if (!isApproved) {
                throw new Error("Company not found or update failed.");
            }
            return isApproved

        } catch (error: any) {
            throw new ErrorResponse(error.message, error.status);
        }
    }

    async getDashboardData(): Promise<any> {
        try {

            const dashboardData = await this.adminRepository.getDashboardData()
            if (!dashboardData) {
                throw new Error("Could not found or fetch the Dash board data of Admin.");
            }
            return dashboardData
        } catch (error: any) {
            throw new ErrorResponse(error.message, error.status);
        }
    }

    async getMonthlyRevenue(): Promise<any> {
        try {

            const monthlyRevenue = await this.adminRepository.getMonthlyRevenue()
            if (!monthlyRevenue) {
                throw new Error("Could not found or fetch the Dash board data of Admin.");
            }
            return monthlyRevenue
        } catch (error: any) {
            throw new ErrorResponse(error.message, error.status);
        }
    }

    async getRevenueByRange(fromDate: Date, toDate: Date): Promise<any> {
        try {
            const revenuesByRange = await this.adminRepository.getRevenueByRange(fromDate, toDate)
            if (!revenuesByRange) {
                throw new Error("Could not found or fetch the Range wise Revenues data of Admin.");
            }
            return revenuesByRange
        } catch (error: any) {
            throw new ErrorResponse(error.message, error.status);
        }
    }


    ///SUbscirption ////

    async addSubscriptionPlan(plan: SubscriptionPlan): Promise<SubscriptionPlan> {
        try {

        } catch (error: any) {
            throw new ErrorResponse(error.message, error.status);
        }
        throw new Error("Method not implemented.");
    }


    // /Sales Report/ //
    async getLastMonthRevenue(page: number, limit: number): Promise<{ revenues: Booking[] | null, totalRevenues: number }> {
        try {
            if (!page || !limit) {
                throw new ErrorResponse("Page or Limit is required to fetch revenue data!", StatusCode.BAD_REQUEST);
            }
            const revenues = await this.adminRepository.getLast30DaysRevenue(page, limit)
            return revenues
        } catch (error: unknown) {
            throw new ErrorResponse((error as Error).message, StatusCode.INTERNAL_SERVER_ERROR);
        }
    }
    async getRevenuesByDateRange(fromDate: Date, toDate: Date, page: number, limit: number): Promise<{ revenues: Booking[], totalRevenues: number }> {
        try {
            if (!page || !limit) {
                throw new ErrorResponse("Page or Limit is required to fetch revenue data!", StatusCode.BAD_REQUEST);
            }
            const revenues = await this.adminRepository.getRevenuesByDateRange(fromDate, toDate, page, limit)
            return revenues
        } catch (error) {
            throw new ErrorResponse((error as Error).message, StatusCode.INTERNAL_SERVER_ERROR);
        }
    }


}