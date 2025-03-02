import { Booking } from "../entities/Booking";
import { Company } from "../entities/Company";
import { SubscriptionPlan } from "../entities/SubscriptionPlan";

export interface IAdminRepository {

    //user-management
    getAllUsers(page: number, limit: number, searchQry: string, filter: string): Promise<{ users: any[]; totalUsers: number }>
    isBlocked(email: string, userId: string): Promise<object>

    //company-management
    getRegisteredCompany(page: number, limit: number, searchQry: string): Promise<{ companies: any[]; totalCompany: number }>
    getApprovedCompany(page: number, limit: number, searchQry: string, filter: string): Promise<{ companies: any[]; totalCompany: number }>
    approveTheCompany(companyId: string, companyEmail: string): Promise<Company>
    companyBlockToggle(companyId: string, companyEmail: string): Promise<object>

    //Dashboard
    getDashboardData(): Promise<any>;
    getMonthlyRevenue(): Promise<any>;
    getRevenueByRange(fromDate: Date, toDate: Date): Promise<any>

    //Subscription
    addSubscriptionPlan(plan: SubscriptionPlan): Promise<SubscriptionPlan>

    //Sales Report
    getLastMonthRevenue(page: number, limit: number): Promise<Booking[] | null>;
    getLast30DaysRevenue(page: number, limit: number): Promise<{ revenues: Booking[] | null, totalRevenues: number }>;
    getRevenuesByDateRange(fromDate: Date, toDate: Date, page: number, limit: number): Promise<{ revenues: Booking[], totalRevenues: number }>

}