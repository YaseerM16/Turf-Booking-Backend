import { Response } from "express";
import { StatusCode } from "../enums/StatusCode";
import { ResponseModel } from "./ResponseModel";

export const sendResponse = <T>(
    res: Response,
    success: boolean,
    message: string,
    statusCode: number,
    additionalFields?: Record<string, T>
): void => {
    const response = new ResponseModel(success, message, additionalFields);
    res.status(statusCode).json(response);
};
