import { SubscriptionPlan as PlanEntity } from "../../../domain/entities/SubscriptionPlan";
import { Subscription } from "../../../domain/entities/Subscription"
import mongoose, { Model } from "mongoose";
import { StatusCode } from "../../../shared/enums/StatusCode";
import { ErrorResponse } from "../../../shared/utils/errors";
import { ISubscriptionPlanRepository } from "../../../domain/repositories/ISubscriptionPlanRepository";
import WalletModel from "../models/WalletModel";

export class SubscriptionPlanRepository implements ISubscriptionPlanRepository {
    private subscriptionPlanModel: Model<PlanEntity>;
    private subscriptionModel: Model<Subscription>;

    constructor(subscriptionPlanModel: Model<PlanEntity>, subscriptionModel: Model<Subscription>) {
        this.subscriptionPlanModel = subscriptionPlanModel;
        this.subscriptionModel = subscriptionModel;
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

    async subscribeToPlan(userId: string, plan: PlanEntity, paymentMethod: string): Promise<Subscription> {
        const session = await mongoose.startSession();
        session.startTransaction();

        try {
            // Fetch user's wallet
            const wallet = await WalletModel.findOne({ userId }).session(session);
            if (!wallet) throw new Error("Wallet not found");

            if (paymentMethod === "wallet") {
                // Check if wallet has enough balance
                if (wallet.walletBalance < plan.price) {
                    throw new Error("Insufficient wallet balance");
                }

                // Deduct amount from wallet
                wallet.walletBalance -= plan.price;
                wallet.walletTransaction.push({
                    transactionDate: new Date(), // Include the missing required field
                    transactionAmount: plan.price,
                    transactionType: "debit",
                    transactionMethod: "wallet",
                });
                await wallet.save({ session });

            } else {
                throw new Error("Invalid payment method");
            }

            // Calculate subscription end date
            const endDate = new Date();
            endDate.setMonth(endDate.getMonth() + (plan.duration === "monthly" ? 1 : 12));

            // Create Subscription entity
            const subscriptionEntity = new Subscription(
                new mongoose.Types.ObjectId() as unknown as string, // Generate a new ObjectId for _id
                userId,
                plan._id,
                "active",
                new Date(), // startDate (fix applied)
                endDate,
                `WALLET-${new Date().getTime()}`, // Mock payment ID
                new Date(), // createdAt (optional)
                new Date()  // updatedAt (optional)
            );

            // Save Subscription in DB
            const subscription = new this.subscriptionModel(subscriptionEntity);
            await subscription.save({ session });

            // Commit transaction
            await session.commitTransaction();
            session.endSession();

            return subscriptionEntity;
        } catch (error) {
            await session.abortTransaction();
            session.endSession();
            throw error;
        }
    }

    async checkForSubscription(userId: string): Promise<PlanEntity | null> {
        try {
            // Find an active subscription for the user
            const activeSubscription = await this.subscriptionModel.findOne({
                userId,
                status: "active",
            });

            if (!activeSubscription) return null; // No active subscription found

            // Find the subscription plan using the planId from the subscription
            const plan = await this.subscriptionPlanModel.findById(activeSubscription.planId);

            return plan ? new PlanEntity(
                plan._id,
                plan.name,
                plan.price,
                plan.duration,
                plan.features,
                plan.isActive,
                plan.isDelete,
                plan.discount,
                plan.createdAt,
                plan.updatedAt
            ) : null; // Return the plan entity or null if not found
        } catch (error) {
            console.error("Error checking subscription:", error);
            throw new Error("Failed to check subscription.");
        }
    }


}
