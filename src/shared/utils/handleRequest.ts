// commonCallback.ts
import { Request, Response } from 'express';
import { sendResponse } from './responseUtil';
import { StatusCode } from '../enums/StatusCode';

export const RequestCallback = (controllerMethod: (req: Request, res: Response) => Promise<void>) => {
    return async (req: Request, res: Response) => {
        try {
            console.log("HANDling REQuest :::: ");

            await controllerMethod(req, res);
        } catch (error) {
            // Handle error (you can customize this part)
            console.error("Error while handling common Request :", error);
            sendResponse(res, false, "Something went wrong with the Request :", StatusCode.INTERNAL_SERVER_ERROR)
        }
    };
};