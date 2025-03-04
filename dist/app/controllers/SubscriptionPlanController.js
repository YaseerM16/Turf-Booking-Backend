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
exports.SubscriptionPlanController = void 0;
// import { ISubscriptionPlanUseCase } from "../../domain/usecases/ISubscriptionPlanUseCase";
// import { sendResponse } from "../../shared/utils/sendResponse";
const StatusCode_1 = require("../../shared/enums/StatusCode");
const responseUtil_1 = require("../../shared/utils/responseUtil");
class SubscriptionPlanController {
    constructor(subscriptionPlanUseCase) {
        this.subscriptionPlanUseCase = subscriptionPlanUseCase;
    }
    createPlan(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const plans = yield this.subscriptionPlanUseCase.createPlan(req.body);
                (0, responseUtil_1.sendResponse)(res, true, "Subscription Plan Created Successfully", StatusCode_1.StatusCode.SUCCESS, { plans });
            }
            catch (error) {
                (0, responseUtil_1.sendResponse)(res, false, error.message, StatusCode_1.StatusCode.INTERNAL_SERVER_ERROR);
            }
        });
    }
    getPlanById(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.params;
                const plan = yield this.subscriptionPlanUseCase.getPlanById(id);
                if (!plan) {
                    (0, responseUtil_1.sendResponse)(res, false, "Subscription Plan Not Found", StatusCode_1.StatusCode.NOT_FOUND);
                }
                (0, responseUtil_1.sendResponse)(res, true, "Subscription Plan Retrieved Successfully", StatusCode_1.StatusCode.SUCCESS, { plan });
            }
            catch (error) {
                (0, responseUtil_1.sendResponse)(res, false, error.message, StatusCode_1.StatusCode.INTERNAL_SERVER_ERROR);
            }
        });
    }
    getAllPlans(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { page, limit } = req.query;
                const plans = yield this.subscriptionPlanUseCase.getAllPlans(page, limit);
                (0, responseUtil_1.sendResponse)(res, true, "All Subscription Plans Retrieved Successfully", StatusCode_1.StatusCode.SUCCESS, { plans });
            }
            catch (error) {
                console.log("THos so getAllPlans ERROR :", error);
                (0, responseUtil_1.sendResponse)(res, false, error.message, StatusCode_1.StatusCode.INTERNAL_SERVER_ERROR);
            }
        });
    }
    updatePlan(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.params;
                const updatedPlan = yield this.subscriptionPlanUseCase.updatePlan(id, req.body);
                if (!updatedPlan) {
                    (0, responseUtil_1.sendResponse)(res, false, "Subscription Plan Not Found", StatusCode_1.StatusCode.NOT_FOUND);
                }
                (0, responseUtil_1.sendResponse)(res, true, "Subscription Plan Updated Successfully", StatusCode_1.StatusCode.SUCCESS, { updatedPlan });
            }
            catch (error) {
                (0, responseUtil_1.sendResponse)(res, false, error.message, StatusCode_1.StatusCode.INTERNAL_SERVER_ERROR);
            }
        });
    }
    deletePlan(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.params;
                yield this.subscriptionPlanUseCase.deletePlan(id);
                (0, responseUtil_1.sendResponse)(res, true, "Subscription Plan Deleted Successfully", StatusCode_1.StatusCode.SUCCESS);
            }
            catch (error) {
                (0, responseUtil_1.sendResponse)(res, false, error.message, StatusCode_1.StatusCode.INTERNAL_SERVER_ERROR);
            }
        });
    }
    getPaymentHashSubscription(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // // console.log("GET PYMENT HASH ");
                // // console.log("REQuest BODY in getPaymntHash :", req.body);
                // const { txnid, amount, productinfo, name: username, email, udf1, udf2, udf3, udf4, udf5, udf6, udf7 } = req.body;
                // if (
                //     !txnid ||
                //     !amount ||
                //     !productinfo ||
                //     !username ||
                //     !email ||
                //     !udf1 ||
                //     !udf2 ||
                //     !udf3 ||
                //     !udf4
                // ) {
                //     console.log("Some Field is NOT !!!");
                //     res.status(400).send("Mandatory fields missing");
                //     return;
                // }
                // const hash = await generatePaymentHash({
                //     txnid, amount, productinfo, username, email, udf1, udf2, udf3, udf4, udf5, udf6, udf7,
                // });
                // console.log('last', { hash, udf6, udf7 });
                const hashObject = yield this.subscriptionPlanUseCase.generatePaymenthash(req.body);
                const { hash, udf6, udf7 } = hashObject;
                (0, responseUtil_1.sendResponse)(res, true, "The Payment Hash generated successfully for subscription..:) ", StatusCode_1.StatusCode.SUCCESS, { hash, udf6, udf7 });
                // res.send({ hash, udf6, udf7 });
            }
            catch (error) {
                (0, responseUtil_1.sendResponse)(res, false, `${error.message}` || "Error Occurs while generation payment link :(", StatusCode_1.StatusCode.INTERNAL_SERVER_ERROR);
            }
        });
    }
    subscribeToPlan(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { userId } = req.params;
                const paymentMethod = req.query.paymentMethod;
                // console.log("This is the SubscribeToPlan Constrol: ");
                // console.log("USer ID : ", userId);
                // console.log("Payment method ", req.query.paymentMethod);
                // console.log("Body :", req.body);
                const subscribe = yield this.subscriptionPlanUseCase.subscribeToPlan(userId, req.body, paymentMethod);
                (0, responseUtil_1.sendResponse)(res, true, "Subscribed to Plan Successfully :!", StatusCode_1.StatusCode.SUCCESS, { subscribe });
            }
            catch (error) {
                (0, responseUtil_1.sendResponse)(res, false, error.message, StatusCode_1.StatusCode.INTERNAL_SERVER_ERROR);
            }
        });
    }
    checkSubscription(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { userId } = req.params;
                const plan = yield this.subscriptionPlanUseCase.checkForSubscription(userId);
                (0, responseUtil_1.sendResponse)(res, true, "Plan Fetched Successfully ..!", StatusCode_1.StatusCode.SUCCESS, { plan });
            }
            catch (error) {
                (0, responseUtil_1.sendResponse)(res, false, error.message, StatusCode_1.StatusCode.INTERNAL_SERVER_ERROR);
            }
        });
    }
}
exports.SubscriptionPlanController = SubscriptionPlanController;
