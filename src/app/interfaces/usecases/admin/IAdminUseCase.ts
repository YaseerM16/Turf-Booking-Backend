import { Admin } from "../../../../domain/entities/Admin";
import { Company } from "../../../../domain/entities/Company";
import { User } from "../../../../domain/entities/User";
User

export interface IAdminUseCase {
    adminLogin(email: string, password: string): Promise<object | null>;
    getUsers(page: number, limit: number, searchQry: string): Promise<{ users: any[]; totalUsers: number }>
    isBlocked(email: string, userId: string): Promise<object>
    getRegisteredCompanies(page: number, limit: number): Promise<{ companies: any[]; totalCompanies: number }>
    approveCompany(companyId: string, companyEmail: string): Promise<Company>
}
