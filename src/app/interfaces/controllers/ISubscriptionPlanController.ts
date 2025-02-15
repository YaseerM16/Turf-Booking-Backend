import { Request, Response } from "express";

export interface ISubscriptionPlanController {
    addSubscriptionPlan(req: Request, res: Response): Promise<Response>;
    getSubscriptionPlanById(req: Request, res: Response): Promise<Response>;
    getAllSubscriptionPlans(req: Request, res: Response): Promise<Response>;
    updateSubscriptionPlan(req: Request, res: Response): Promise<Response>;
    deleteSubscriptionPlan(req: Request, res: Response): Promise<Response>;
}
