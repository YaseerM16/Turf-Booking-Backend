import { Company } from "../entities/Company";

export interface IAdminRepository {
    getAllUsers(page: number, limit: number, searchQry: string): Promise<{ users: any[]; totalUsers: number }>
    isBlocked(email: string, userId: string): Promise<object>
    getRegisteredCompany(page: number, limit: number): Promise<{ companies: any[]; totalCompany: number }>
    // create(company: Company): Promise<Company>;
    // update(id: string, value: any): Promise<Company | null>
}