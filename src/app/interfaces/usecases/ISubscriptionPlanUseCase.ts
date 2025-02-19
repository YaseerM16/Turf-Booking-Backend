import { SubscriptionPlan as PlanEntity, SubscriptionPlan } from "../../../domain/entities/SubscriptionPlan";

export interface ISubscriptionPlanUseCase {
    createPlan(plan: PlanEntity): Promise<{ plans: PlanEntity[], totalPlans: number }>;
    getPlanById(id: string): Promise<PlanEntity | null>;
    getAllPlans(page: number, limit: number): Promise<{ plans: PlanEntity[], totalPlans: number }>;
    updatePlan(id: string, updatedPlan: Partial<PlanEntity>): Promise<PlanEntity | null>;
    deletePlan(id: string): Promise<void>;
    subscribeToPlan(userId: string, plan: SubscriptionPlan, paymentMethod: string): Promise<any>;
    checkForSubscription(userId: string): Promise<SubscriptionPlan | null>
}
