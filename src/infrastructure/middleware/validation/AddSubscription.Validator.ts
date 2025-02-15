import { Request, Response, NextFunction } from "express";
import { sendResponse } from "../../../shared/utils/responseUtil";
import { StatusCode } from "../../../shared/enums/StatusCode";

export const validateAddSubscription = (req: Request, res: Response, next: NextFunction) => {
    const { name, price, duration, features, discount } = req.body;
    // console.log("THis is valid SUBSC :", name, price, duration, features);

    if (!name || name.trim().length < 5) {
        sendResponse(res, false, "Plan name must be at least 5 characters long.", StatusCode.BAD_REQUEST);
        return;
    }

    if (!price || isNaN(price) || Number(price) < 500) {
        sendResponse(res, false, "Price must be at least ₹500.", StatusCode.BAD_REQUEST);
        return;
    }

    if (!duration || !["monthly", "yearly"].includes(duration)) {
        sendResponse(res, false, "Please select a valid duration ('monthly' or 'yearly').", StatusCode.BAD_REQUEST);
        return;
    }

    if (typeof features !== "string" || features.trim().length < 5) {
        sendResponse(res, false, "Features must be at least 5 characters long.", StatusCode.BAD_REQUEST);
        return;
    }


    if (discount !== undefined) {
        if (isNaN(discount) || Number(discount) < 0 || Number(discount) > 100) {
            sendResponse(res, false, "Discount must be a number between 0 and 100.", StatusCode.BAD_REQUEST);
            return;
        }
    }

    next();
};
