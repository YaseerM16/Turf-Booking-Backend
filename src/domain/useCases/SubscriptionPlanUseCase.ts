import { ISubscriptionPlanUseCase } from "../../app/interfaces/usecases/ISubscriptionPlanUseCase";
import { SubscriptionPlan as PlanEntity } from "../../domain/entities/SubscriptionPlan"
import { ISubscriptionPlanRepository } from "../repositories/ISubscriptionPlanRepository";


export class SubscriptionPlanUseCase implements ISubscriptionPlanUseCase {
    private subscriptionPlanRepository: ISubscriptionPlanRepository;

    constructor(subscriptionPlanRepository: ISubscriptionPlanRepository) {
        this.subscriptionPlanRepository = subscriptionPlanRepository;
    }

    async createPlan(plan: PlanEntity): Promise<{ plans: PlanEntity[], totalPlans: number }> {
        return this.subscriptionPlanRepository.addSubscriptionPlan(plan);
    }

    async getPlanById(id: string): Promise<PlanEntity | null> {
        return this.subscriptionPlanRepository.getSubscriptionPlanById(id);
    }

    async getAllPlans(page: number, limit: number): Promise<{ plans: PlanEntity[], totalPlans: number }> {
        return this.subscriptionPlanRepository.getAllSubscriptionPlans(page, limit);
    }

    async updatePlan(id: string, updatedPlan: Partial<PlanEntity>): Promise<PlanEntity | null> {
        return this.subscriptionPlanRepository.updateSubscriptionPlan(id, updatedPlan);
    }

    async deletePlan(id: string): Promise<void> {
        return this.subscriptionPlanRepository.deleteSubscriptionPlan(id);
    }

    async subscribeToPlan(userId: string, plan: PlanEntity, paymentMethod: string): Promise<any> {
        return this.subscriptionPlanRepository.subscribeToPlan(userId, plan, paymentMethod)
    }

    async checkForSubscription(userId: string): Promise<PlanEntity | null> {
        return this.subscriptionPlanRepository.checkForSubscription(userId)
    }
}
