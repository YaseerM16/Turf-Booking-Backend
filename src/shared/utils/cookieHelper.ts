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

export const setCompanyCookies = (res: Response, token: string, refreshToken: string) => {
    const isProduction = config.MODE === "production";

    res.cookie("CompanyRefreshToken", refreshToken, {
        httpOnly: true,
        secure: isProduction ? true : false,
        sameSite: isProduction ? "none" : "lax",
        domain: isProduction ? ".turfbooking.online" : 'localhost'
    });

    res.cookie("CompanyToken", token, {
        httpOnly: false,
        secure: isProduction ? true : false,
        sameSite: isProduction ? "none" : "lax",
        domain: isProduction ? ".turfbooking.online" : 'localhost'
    });
};

export const setAdminCookies = (res: Response, token: string, refreshToken: string) => {
    const isProduction = config.MODE === "production";

    res.cookie("AdminRefreshToken", refreshToken, {
        httpOnly: true,
        secure: isProduction ? true : false,
        sameSite: isProduction ? "none" : "lax",
        domain: isProduction ? ".turfbooking.online" : 'localhost'
    });

    res.cookie("AdminToken", token, {
        httpOnly: false,
        secure: isProduction ? true : false,
        sameSite: isProduction ? "none" : "lax",
        domain: isProduction ? ".turfbooking.online" : 'localhost'
    });
};
