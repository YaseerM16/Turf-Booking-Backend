import { Admin } from "../../../../domain/entities/Admin";
import { Company } from "../../../../domain/entities/Company";
import { User } from "../../../../domain/entities/User";
User

export interface IAdminUseCase {
    //auth
    adminLogin(email: string, password: string): Promise<object | null>;

    //user-management
    getUsers(page: number, limit: number, searchQry: string, filter: string): Promise<{ users: any[]; totalUsers: number }>
    isBlocked(email: string, userId: string): Promise<object>


    //company-management
    getRegisteredCompanies(page: number, limit: number, searchQry: string): Promise<{ companies: any[]; totalCompanies: number }>
    getApprovedCompanies(page: number, limit: number, searchQry: string, filter: string): Promise<{ companies: any[]; totalCompanies: number }>
    approveCompany(companyId: string, companyEmail: string): Promise<Company>
    companyBlockToggle(email: string, companyId: string): Promise<object>
}
