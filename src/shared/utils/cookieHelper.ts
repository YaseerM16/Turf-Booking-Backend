import { Response } from "express";
import { config } from "../../config/config";
// import { config } from "../config";

export const setUserCookies = (res: Response, token: string, refreshToken: string) => {
    const isProduction = config.MODE === "production";

    res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: isProduction ? true : false,
        sameSite: isProduction ? "none" : "lax",
        domain: isProduction ? ".turfbooking.online" : 'localhost'
    });

    res.cookie("token", token, {
        httpOnly: false,
        secure: isProduction ? true : false,
        sameSite: isProduction ? "none" : "lax",
        domain: isProduction ? ".turfbooking.online" : 'localhost'
    });
};
