// import { SubscriptionPlan as PlanEntity } from "../../../domain/entities/SubscriptionPlan";
import { SubscriptionPlan } from "../../domain/entities/SubscriptionPlan"

export interface ISubscriptionPlanRepository {
    addSubscriptionPlan(plan: SubscriptionPlan): Promise<{ plans: SubscriptionPlan[], totalPlans: number }>;
    getSubscriptionPlanById(id: string): Promise<SubscriptionPlan | null>;
    getAllSubscriptionPlans(page: number, limit: number): Promise<{ plans: SubscriptionPlan[], totalPlans: number }>;
    updateSubscriptionPlan(id: string, updatedPlan: Partial<SubscriptionPlan>): Promise<SubscriptionPlan | null>;
    deleteSubscriptionPlan(id: string): Promise<void>;
}
