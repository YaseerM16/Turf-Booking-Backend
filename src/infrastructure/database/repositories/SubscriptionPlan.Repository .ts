import { SubscriptionPlan as PlanEntity } from "../../../domain/entities/SubscriptionPlan";
import { Model } from "mongoose";
import { StatusCode } from "../../../shared/enums/StatusCode";
import { ErrorResponse } from "../../../shared/utils/errors";
import { ISubscriptionPlanRepository } from "../../../domain/repositories/ISubscriptionPlanRepository";

export class SubscriptionPlanRepository implements ISubscriptionPlanRepository {
    private subscriptionPlanModel: Model<PlanEntity>;

    constructor(subscriptionPlanModel: Model<PlanEntity>) {
        this.subscriptionPlanModel = subscriptionPlanModel;
    }

    async addSubscriptionPlan(plan: PlanEntity): Promise<{ plans: PlanEntity[], totalPlans: number }> {
        try {
            // Convert the plan name to lowercase for case-insensitive comparison
            const planNameLower = plan.name.toLowerCase();

            // Check if a plan with the same name already exists
            const existingPlan = await this.subscriptionPlanModel.findOne({
                name: planNameLower,
                isDelete: false
            });

            if (existingPlan) {
                throw new ErrorResponse("A subscription plan with this name already exists.", StatusCode.BAD_REQUEST);
            }

            // Assign the lowercase name back to the plan object before saving
            const newPlan = new this.subscriptionPlanModel({ ...plan, name: planNameLower });
            await newPlan.save();

            // Fetch the latest 6 plans
            const plans = await this.subscriptionPlanModel
                .find({ isDelete: false })
                .sort({ createdAt: -1 })
                .limit(6)
                .lean();

            const totalPlans = await this.subscriptionPlanModel.countDocuments({ isDelete: false });

            return { plans: plans as unknown as PlanEntity[], totalPlans };
        } catch (error) {
            throw new ErrorResponse((error as Error).message, StatusCode.INTERNAL_SERVER_ERROR);
        }
    }


    async getSubscriptionPlanById(id: string): Promise<PlanEntity | null> {
        try {
            const plan = await this.subscriptionPlanModel.findById(id).lean();
            return plan as unknown as PlanEntity;
        } catch (error) {
            throw new ErrorResponse((error as Error).message, StatusCode.INTERNAL_SERVER_ERROR);
        }
    }

    async getAllSubscriptionPlans(page: number, limit: number): Promise<{ plans: PlanEntity[], totalPlans: number }> {
        try {
            const skip = (page - 1) * limit;

            const plans = await this.subscriptionPlanModel
                .find({ isDelete: false })
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean();

            const totalPlans = await this.subscriptionPlanModel.countDocuments({ isDelete: false });

            return { plans: plans as unknown as PlanEntity[], totalPlans };
        } catch (error) {
            throw new ErrorResponse((error as Error).message, StatusCode.INTERNAL_SERVER_ERROR);
        }
    }



    async updateSubscriptionPlan(id: string, updatedPlan: Partial<PlanEntity>): Promise<PlanEntity | null> {
        try {
            if (!updatedPlan.name) throw new ErrorResponse("A subscription plan name is not getting while trying to update it..!.", StatusCode.BAD_REQUEST);

            const planNameLower = updatedPlan.name.toLowerCase();

            // Check if a plan with the same name already exists
            const existingPlan = await this.subscriptionPlanModel.findOne({
                name: planNameLower,
                isDelete: false
            });

            if (existingPlan) {
                throw new ErrorResponse("A subscription plan with this name already exists.", StatusCode.BAD_REQUEST);
            }
            const plan = await this.subscriptionPlanModel.findByIdAndUpdate(id, { ...updatedPlan, name: planNameLower }, { new: true, runValidators: true }).lean();
            return plan as unknown as PlanEntity;
        } catch (error) {
            throw new ErrorResponse((error as Error).message, StatusCode.INTERNAL_SERVER_ERROR);
        }
    }

    async deleteSubscriptionPlan(id: string): Promise<void> {
        try {
            if (!id) throw new ErrorResponse("A subscription plan ID is not getting while trying to Delete it..!.", StatusCode.BAD_REQUEST);
            await this.subscriptionPlanModel.findByIdAndUpdate(id, { isDelete: true });
        } catch (error) {
            throw new ErrorResponse((error as Error).message, StatusCode.INTERNAL_SERVER_ERROR);
        }
    }

}
