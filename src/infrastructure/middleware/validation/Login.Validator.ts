import { Request, Response, NextFunction } from "express";
import { sendResponse } from "../../../shared/utils/responseUtil";
import { StatusCode } from "../../../shared/enums/StatusCode";

export const validateLogin = (req: Request, res: Response, next: NextFunction) => {
    const { email, password, name } = req.body;

    if (!email || !/\S+@\S+\.\S+/.test(email)) {
        sendResponse(res, false, "Please provide a valid email address.", StatusCode.BAD_REQUEST)
        return
    }

    if (!password || password.length < 6) {
        sendResponse(res, false, "Password must be at least 6 characters long.", StatusCode.BAD_REQUEST)
        return
    }
    next();

}