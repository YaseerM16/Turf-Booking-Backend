import { ISubscriptionPlanUseCase } from "../../app/interfaces/usecases/ISubscriptionPlanUseCase";
import { SubscriptionPlan as PlanEntity } from "../../domain/entities/SubscriptionPlan"
import { generatePaymentHash } from "../../infrastructure/services/BookingService";
import { StatusCode } from "../../shared/enums/StatusCode";
import { PaymentData } from "../../shared/utils/constants";
import { ErrorResponse } from "../../shared/utils/errors";
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

    async generatePaymenthash(paymentDetails: PaymentData): Promise<object> {
        try {

            const { txnid, amount, productinfo, name, email, udf1, udf2, udf3, udf4, udf5, udf6, udf7 } = paymentDetails

            const userId = udf1
            const userPlanExist = await this.subscriptionPlanRepository.checkForExistPlan(userId)

            if (userPlanExist) throw new Error("Already has a active subscription..!");
            if (
                !txnid ||
                !amount ||
                !productinfo ||
                !name ||
                !email ||
                !udf1 ||
                !udf2 ||
                !udf3 ||
                !udf4
            ) throw new Error("Mandatory fields missing");

            const hash = await generatePaymentHash({
                txnid, amount, productinfo, username: name, email, udf1, udf2, udf3, udf4, udf5, udf6, udf7,
            });

            return { hash, udf6, udf7 }

        } catch (error) {
            throw new ErrorResponse((error as Error).message, StatusCode.INTERNAL_SERVER_ERROR);
        }
    }
}
