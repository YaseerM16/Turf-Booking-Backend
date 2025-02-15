import { Request, Response } from "express";
// import { ISubscriptionPlanUseCase } from "../../domain/usecases/ISubscriptionPlanUseCase";
// import { sendResponse } from "../../shared/utils/sendResponse";
import { StatusCode } from "../../shared/enums/StatusCode";
import { ISubscriptionPlanUseCase } from "../interfaces/usecases/ISubscriptionPlanUseCase";
import { sendResponse } from "../../shared/utils/responseUtil";

export class SubscriptionPlanController {
    private subscriptionPlanUseCase: ISubscriptionPlanUseCase;

    constructor(subscriptionPlanUseCase: ISubscriptionPlanUseCase) {
        this.subscriptionPlanUseCase = subscriptionPlanUseCase;
    }

    async createPlan(req: Request, res: Response): Promise<void> {
        try {
            const plans = await this.subscriptionPlanUseCase.createPlan(req.body);
            sendResponse(res, true, "Subscription Plan Created Successfully", StatusCode.SUCCESS, { plans });
        } catch (error) {
            sendResponse(res, false, (error as Error).message, StatusCode.INTERNAL_SERVER_ERROR);
        }
    }

    async getPlanById(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            const plan = await this.subscriptionPlanUseCase.getPlanById(id);
            if (!plan) {
                sendResponse(res, false, "Subscription Plan Not Found", StatusCode.NOT_FOUND);
            }
            sendResponse(res, true, "Subscription Plan Retrieved Successfully", StatusCode.SUCCESS, { plan });
        } catch (error) {
            sendResponse(res, false, (error as Error).message, StatusCode.INTERNAL_SERVER_ERROR);
        }
    }

    async getAllPlans(req: Request, res: Response): Promise<void> {
        try {
            const { page, limit } = req.query
            const plans = await this.subscriptionPlanUseCase.getAllPlans(page as unknown as number, limit as unknown as number);
            sendResponse(res, true, "All Subscription Plans Retrieved Successfully", StatusCode.SUCCESS, { plans });
        } catch (error) {
            console.log("THos so getAllPlans ERROR :", error);
            sendResponse(res, false, (error as Error).message, StatusCode.INTERNAL_SERVER_ERROR);
        }
    }

    async updatePlan(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            const updatedPlan = await this.subscriptionPlanUseCase.updatePlan(id, req.body);
            if (!updatedPlan) {
                sendResponse(res, false, "Subscription Plan Not Found", StatusCode.NOT_FOUND);
            }
            sendResponse(res, true, "Subscription Plan Updated Successfully", StatusCode.SUCCESS, { updatedPlan });
        } catch (error) {
            sendResponse(res, false, (error as Error).message, StatusCode.INTERNAL_SERVER_ERROR);
        }
    }

    async deletePlan(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            await this.subscriptionPlanUseCase.deletePlan(id);
            sendResponse(res, true, "Subscription Plan Deleted Successfully", StatusCode.SUCCESS);
        } catch (error) {
            sendResponse(res, false, (error as Error).message, StatusCode.INTERNAL_SERVER_ERROR);
        }
    }
}
