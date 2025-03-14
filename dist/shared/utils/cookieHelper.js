"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setUserCookies = void 0;
const config_1 = require("../../config/config");
// import { config } from "../config";
const setUserCookies = (res, token, refreshToken) => {
    const isProduction = config_1.config.MODE === "production";
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
exports.setUserCookies = setUserCookies;
