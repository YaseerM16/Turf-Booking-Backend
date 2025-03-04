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
Object.defineProperty(exports, "__esModule", { value: true });
exports.SubscriptionPlanUseCase = void 0;
const BookingService_1 = require("../../infrastructure/services/BookingService");
const StatusCode_1 = require("../../shared/enums/StatusCode");
const errors_1 = require("../../shared/utils/errors");
class SubscriptionPlanUseCase {
    constructor(subscriptionPlanRepository) {
        this.subscriptionPlanRepository = subscriptionPlanRepository;
    }
    createPlan(plan) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.subscriptionPlanRepository.addSubscriptionPlan(plan);
        });
    }
    getPlanById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.subscriptionPlanRepository.getSubscriptionPlanById(id);
        });
    }
    getAllPlans(page, limit) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.subscriptionPlanRepository.getAllSubscriptionPlans(page, limit);
        });
    }
    updatePlan(id, updatedPlan) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.subscriptionPlanRepository.updateSubscriptionPlan(id, updatedPlan);
        });
    }
    deletePlan(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.subscriptionPlanRepository.deleteSubscriptionPlan(id);
        });
    }
    subscribeToPlan(userId, plan, paymentMethod) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.subscriptionPlanRepository.subscribeToPlan(userId, plan, paymentMethod);
        });
    }
    checkForSubscription(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.subscriptionPlanRepository.checkForSubscription(userId);
        });
    }
    generatePaymenthash(paymentDetails) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { txnid, amount, productinfo, name, email, udf1, udf2, udf3, udf4, udf5, udf6, udf7 } = paymentDetails;
                const userId = udf1;
                const userPlanExist = yield this.subscriptionPlanRepository.checkForExistPlan(userId);
                if (userPlanExist)
                    throw new Error("Already has a active subscription..!");
                if (!txnid ||
                    !amount ||
                    !productinfo ||
                    !name ||
                    !email ||
                    !udf1 ||
                    !udf2 ||
                    !udf3 ||
                    !udf4)
                    throw new Error("Mandatory fields missing");
                const hash = yield (0, BookingService_1.generatePaymentHash)({
                    txnid, amount, productinfo, username: name, email, udf1, udf2, udf3, udf4, udf5, udf6, udf7,
                });
                return { hash, udf6, udf7 };
            }
            catch (error) {
                throw new errors_1.ErrorResponse(error.message, StatusCode_1.StatusCode.INTERNAL_SERVER_ERROR);
            }
        });
    }
}
exports.SubscriptionPlanUseCase = SubscriptionPlanUseCase;
