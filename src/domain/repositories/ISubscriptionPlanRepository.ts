// import { SubscriptionPlan as PlanEntity } from "../../../domain/entities/SubscriptionPlan";
import { SubscriptionPlan } from "../../domain/entities/SubscriptionPlan"
import { Subscription } from "../entities/Subscription";

export interface ISubscriptionPlanRepository {
    addSubscriptionPlan(plan: SubscriptionPlan): Promise<{ plans: SubscriptionPlan[], totalPlans: number }>;
    getSubscriptionPlanById(id: string): Promise<SubscriptionPlan | null>;
    getAllSubscriptionPlans(page: number, limit: number): Promise<{ plans: SubscriptionPlan[], totalPlans: number }>;
    updateSubscriptionPlan(id: string, updatedPlan: Partial<SubscriptionPlan>): Promise<SubscriptionPlan | null>;
    deleteSubscriptionPlan(id: string): Promise<void>;
    checkForExistPlan(userId: string): Promise<void | boolean>;
    subscribeToPlan(userId: string, plan: SubscriptionPlan, paymentMethod: string): Promise<any>;
    checkForSubscription(userId: string): Promise<SubscriptionPlan | null>
}
