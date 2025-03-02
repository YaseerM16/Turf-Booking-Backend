import { Request, Response } from "express";
// import { ISubscriptionPlanUseCase } from "../../domain/usecases/ISubscriptionPlanUseCase";
// import { sendResponse } from "../../shared/utils/sendResponse";
import { StatusCode } from "../../shared/enums/StatusCode";
import { ISubscriptionPlanUseCase } from "../interfaces/usecases/ISubscriptionPlanUseCase";
import { sendResponse } from "../../shared/utils/responseUtil";
import { generatePaymentHash } from "../../infrastructure/services/BookingService";

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

    async getPaymentHashSubscription(req: Request, res: Response) {
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
            const hashObject: any = await this.subscriptionPlanUseCase.generatePaymenthash(req.body)
            const { hash, udf6, udf7 } = hashObject
            sendResponse(res, true, "The Payment Hash generated successfully for subscription..:) ", StatusCode.SUCCESS, { hash, udf6, udf7 })

            // res.send({ hash, udf6, udf7 });

        } catch (error) {
            sendResponse(res, false, `${(error as Error).message}` || "Error Occurs while generation payment link :(", StatusCode.INTERNAL_SERVER_ERROR)
        }
    }

    async subscribeToPlan(req: Request, res: Response) {
        try {
            const { userId } = req.params
            const paymentMethod = req.query.paymentMethod;
            // console.log("This is the SubscribeToPlan Constrol: ");
            // console.log("USer ID : ", userId);
            // console.log("Payment method ", req.query.paymentMethod);
            // console.log("Body :", req.body);
            const subscribe = await this.subscriptionPlanUseCase.subscribeToPlan(userId, req.body, paymentMethod as string)
            sendResponse(res, true, "Subscribed to Plan Successfully :!", StatusCode.SUCCESS, { subscribe })
        } catch (error) {
            sendResponse(res, false, (error as Error).message, StatusCode.INTERNAL_SERVER_ERROR)
        }
    }

    async checkSubscription(req: Request, res: Response) {
        try {
            const { userId } = req.params
            const plan = await this.subscriptionPlanUseCase.checkForSubscription(userId)
            sendResponse(res, true, "Plan Fetched Successfully ..!", StatusCode.SUCCESS, { plan })
        } catch (error) {
            sendResponse(res, false, (error as Error).message, StatusCode.INTERNAL_SERVER_ERROR)
        }
    }
}
