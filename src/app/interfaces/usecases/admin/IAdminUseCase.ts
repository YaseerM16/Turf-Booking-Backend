import { Company } from "../../../../domain/entities/Company";
import { User } from "../../../../domain/entities/User";
import { SubscriptionPlan } from "../../../../domain/entities/SubscriptionPlan";


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

    //Dashboard
    getDashboardData(): Promise<any>;
    getMonthlyRevenue(): Promise<any>;
    getRevenueByRange(fromDate: Date, toDate: Date): Promise<any>

    //Subscription
    addSubscriptionPlan(plan: SubscriptionPlan): Promise<SubscriptionPlan>
}


