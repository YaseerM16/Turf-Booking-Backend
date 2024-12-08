import { Company } from "../entities/Company";

export interface IAdminRepository {

    //user-management
    getAllUsers(page: number, limit: number, searchQry: string, filter: string): Promise<{ users: any[]; totalUsers: number }>
    isBlocked(email: string, userId: string): Promise<object>

    //company-management
    getRegisteredCompany(page: number, limit: number, searchQry: string): Promise<{ companies: any[]; totalCompany: number }>
    getApprovedCompany(page: number, limit: number, searchQry: string, filter: string): Promise<{ companies: any[]; totalCompany: number }>
    approveTheCompany(companyId: string, companyEmail: string): Promise<Company>
    companyBlockToggle(companyId: string, companyEmail: string): Promise<object>
    // create(company: Company): Promise<Company>;
    // update(id: string, value: any): Promise<Company | null>
}