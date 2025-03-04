"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SubscriptionPlanRepository = void 0;
const SubscriptionPlan_1 = require("../../../domain/entities/SubscriptionPlan");
const Subscription_1 = require("../../../domain/entities/Subscription");
const mongoose_1 = __importDefault(require("mongoose"));
const StatusCode_1 = require("../../../shared/enums/StatusCode");
const errors_1 = require("../../../shared/utils/errors");
const WalletModel_1 = __importDefault(require("../models/WalletModel"));
class SubscriptionPlanRepository {
    constructor(subscriptionPlanModel, subscriptionModel, userModel) {
        this.subscriptionPlanModel = subscriptionPlanModel;
        this.subscriptionModel = subscriptionModel;
        this.userModel = userModel;
    }
    addSubscriptionPlan(plan) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Convert the plan name to lowercase for case-insensitive comparison
                const planNameLower = plan.name.toLowerCase();
                // Check if a plan with the same name already exists
                const existingPlan = yield this.subscriptionPlanModel.findOne({
                    name: planNameLower,
                    isDelete: false
                });
                if (existingPlan) {
                    throw new errors_1.ErrorResponse("A subscription plan with this name already exists.", StatusCode_1.StatusCode.BAD_REQUEST);
                }
                // Assign the lowercase name back to the plan object before saving
                const newPlan = new this.subscriptionPlanModel(Object.assign(Object.assign({}, plan), { name: planNameLower }));
                yield newPlan.save();
                // Fetch the latest 6 plans
                const plans = yield this.subscriptionPlanModel
                    .find({ isDelete: false })
                    .sort({ createdAt: -1 })
                    .limit(6)
                    .lean();
                const totalPlans = yield this.subscriptionPlanModel.countDocuments({ isDelete: false });
                return { plans: plans, totalPlans };
            }
            catch (error) {
                throw new errors_1.ErrorResponse(error.message, StatusCode_1.StatusCode.INTERNAL_SERVER_ERROR);
            }
        });
    }
    getSubscriptionPlanById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const plan = yield this.subscriptionPlanModel.findById(id).lean();
                return plan;
            }
            catch (error) {
                throw new errors_1.ErrorResponse(error.message, StatusCode_1.StatusCode.INTERNAL_SERVER_ERROR);
            }
        });
    }
    getAllSubscriptionPlans(page, limit) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const skip = (page - 1) * limit;
                const plans = yield this.subscriptionPlanModel
                    .find({ isDelete: false })
                    .sort({ createdAt: -1 })
                    .skip(skip || 0)
                    .limit(limit || 0)
                    .lean();
                const totalPlans = yield this.subscriptionPlanModel.countDocuments({ isDelete: false });
                return { plans: plans, totalPlans };
            }
            catch (error) {
                throw new errors_1.ErrorResponse(error.message, StatusCode_1.StatusCode.INTERNAL_SERVER_ERROR);
            }
        });
    }
    updateSubscriptionPlan(id, updatedPlan) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!updatedPlan.name)
                    throw new errors_1.ErrorResponse("A subscription plan name is not getting while trying to update it..!.", StatusCode_1.StatusCode.BAD_REQUEST);
                const planNameLower = updatedPlan.name.toLowerCase();
                // Check if a plan with the same name already exists
                const existingPlan = yield this.subscriptionPlanModel.findOne({
                    name: planNameLower,
                    isDelete: false
                });
                if (existingPlan) {
                    throw new errors_1.ErrorResponse("A subscription plan with this name already exists.", StatusCode_1.StatusCode.BAD_REQUEST);
                }
                const plan = yield this.subscriptionPlanModel.findByIdAndUpdate(id, Object.assign(Object.assign({}, updatedPlan), { name: planNameLower }), { new: true, runValidators: true }).lean();
                return plan;
            }
            catch (error) {
                throw new errors_1.ErrorResponse(error.message, StatusCode_1.StatusCode.INTERNAL_SERVER_ERROR);
            }
        });
    }
    deleteSubscriptionPlan(id) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!id)
                    throw new errors_1.ErrorResponse("A subscription plan ID is not getting while trying to Delete it..!.", StatusCode_1.StatusCode.BAD_REQUEST);
                yield this.subscriptionPlanModel.findByIdAndUpdate(id, { isDelete: true });
            }
            catch (error) {
                throw new errors_1.ErrorResponse(error.message, StatusCode_1.StatusCode.INTERNAL_SERVER_ERROR);
            }
        });
    }
    checkForExistPlan(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const user = yield this.userModel.findById(userId);
                if (!user)
                    throw new Error("User not found");
                if (user.subscriptionPlan)
                    return true;
            }
            catch (error) {
                throw new Error(error.message || "Invalid Payment Method...!");
            }
        });
    }
    subscribeToPlan(userId, plan, paymentMethod) {
        return __awaiter(this, void 0, void 0, function* () {
            const session = yield mongoose_1.default.startSession();
            session.startTransaction();
            // console.log("The Plan :: ", plan);
            try {
                const user = yield this.userModel.findById(userId);
                if (!user)
                    throw new Error("User not found");
                if (user.subscriptionPlan)
                    throw new Error("User already has a subscription");
                if (paymentMethod === "wallet") {
                    // Fetch user's wallet
                    const wallet = yield WalletModel_1.default.findOne({ userId }).session(session);
                    if (!wallet)
                        throw new Error("Wallet not found");
                    // Check if wallet has enough balance
                    if (wallet.walletBalance < plan.price)
                        throw new Error("Insufficient wallet balance");
                    // Deduct amount from wallet
                    wallet.walletBalance -= plan.price;
                    wallet.walletTransaction.push({
                        transactionDate: new Date(), // Include the missing required field
                        transactionAmount: plan.price,
                        transactionType: "debit",
                        transactionMethod: "subscription",
                    });
                    yield wallet.save({ session });
                    // Calculate subscription end date
                    const endDate = new Date();
                    endDate.setMonth(endDate.getMonth() + (plan.duration === "monthly" ? 1 : 12));
                    // Create Subscription entity
                    const subscriptionEntity = new Subscription_1.Subscription(new mongoose_1.default.Types.ObjectId(), // Generate a new ObjectId for _id
                    userId, plan._id, "active", new Date(), // startDate (fix applied)
                    endDate, `WALLET-${new Date().getTime()}`, // Mock payment ID
                    new Date(), // createdAt (optional)
                    new Date() // updatedAt (optional)
                    );
                    // Save Subscription in DB
                    const subscription = new this.subscriptionModel(subscriptionEntity);
                    yield subscription.save({ session });
                    // Populate planId details
                    const populatedSubscription = yield this.subscriptionModel
                        .findById(subscription._id)
                        .populate('planId') // Ensure 'planId' is correctly referenced in your schema
                        .session(session);
                    // Update user's subscriptionPlan field
                    yield this.userModel.findByIdAndUpdate(populatedSubscription === null || populatedSubscription === void 0 ? void 0 : populatedSubscription.userId, { $set: { subscriptionPlan: populatedSubscription === null || populatedSubscription === void 0 ? void 0 : populatedSubscription.planId } }, { session });
                    // Commit transaction
                    yield session.commitTransaction();
                    session.endSession();
                    return populatedSubscription;
                }
                else if (paymentMethod === "payu") {
                    // console.log("THis is the PayMethod PayU of Subcription :", `UserID :${userId}, Plan : ${plan}`);
                    const endDate = new Date();
                    endDate.setMonth(endDate.getMonth() + (plan.duration === "monthly" ? 1 : 12));
                    // Create Subscription entity
                    const subscriptionEntity = new Subscription_1.Subscription(new mongoose_1.default.Types.ObjectId(), // Generate a new ObjectId for _id
                    userId, plan._id, "active", new Date(), // startDate (fix applied)
                    endDate, `WALLET-${new Date().getTime()}`, // Mock payment ID
                    new Date(), // createdAt (optional)
                    new Date() // updatedAt (optional)
                    );
                    // Save Subscription in DB
                    const subscription = new this.subscriptionModel(subscriptionEntity);
                    yield subscription.save({ session });
                    // Populate planId details
                    const populatedSubscription = yield this.subscriptionModel
                        .findById(subscription._id)
                        .populate('planId') // Ensure 'planId' is correctly referenced in your schema
                        .session(session);
                    // Update user's subscriptionPlan field
                    yield this.userModel.findByIdAndUpdate(populatedSubscription === null || populatedSubscription === void 0 ? void 0 : populatedSubscription.userId, { $set: { subscriptionPlan: populatedSubscription === null || populatedSubscription === void 0 ? void 0 : populatedSubscription.planId } }, { session });
                    // Commit transaction
                    yield session.commitTransaction();
                    session.endSession();
                    console.log();
                    return populatedSubscription;
                }
                else {
                    throw new Error("Invalid Payment Method...!");
                }
            }
            catch (error) {
                yield session.abortTransaction();
                session.endSession();
                throw new Error(error.message || "Failed to Subscribe to Plan.");
            }
        });
    }
    checkForSubscription(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Find an active subscription for the user
                const activeSubscription = yield this.subscriptionModel.findOne({
                    userId,
                    status: "active",
                });
                if (!activeSubscription)
                    return null; // No active subscription found
                // Find the subscription plan using the planId from the subscription
                const plan = yield this.subscriptionPlanModel.findById(activeSubscription.planId);
                return plan ? new SubscriptionPlan_1.SubscriptionPlan(plan._id, plan.name, plan.price, plan.duration, plan.features, plan.isActive, plan.isDelete, plan.discount, plan.createdAt, plan.updatedAt) : null; // Return the plan entity or null if not found
            }
            catch (error) {
                throw new Error(error.message || "Failed to check subscription.");
            }
        });
    }
}
exports.SubscriptionPlanRepository = SubscriptionPlanRepository;
