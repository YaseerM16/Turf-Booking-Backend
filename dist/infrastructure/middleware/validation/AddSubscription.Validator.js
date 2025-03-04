"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateAddSubscription = void 0;
const responseUtil_1 = require("../../../shared/utils/responseUtil");
const StatusCode_1 = require("../../../shared/enums/StatusCode");
const validateAddSubscription = (req, res, next) => {
    const { name, price, duration, features, discount } = req.body;
    // console.log("THis is valid SUBSC :", name, price, duration, features);
    if (!name || name.trim().length < 5) {
        (0, responseUtil_1.sendResponse)(res, false, "Plan name must be at least 5 characters long.", StatusCode_1.StatusCode.BAD_REQUEST);
        return;
    }
    if (!price || isNaN(price) || Number(price) < 500) {
        (0, responseUtil_1.sendResponse)(res, false, "Price must be at least ₹500.", StatusCode_1.StatusCode.BAD_REQUEST);
        return;
    }
    if (!duration || !["monthly", "yearly"].includes(duration)) {
        (0, responseUtil_1.sendResponse)(res, false, "Please select a valid duration ('monthly' or 'yearly').", StatusCode_1.StatusCode.BAD_REQUEST);
        return;
    }
    if (typeof features !== "string" || features.trim().length < 5) {
        (0, responseUtil_1.sendResponse)(res, false, "Features must be at least 5 characters long.", StatusCode_1.StatusCode.BAD_REQUEST);
        return;
    }
    if (discount !== undefined) {
        if (isNaN(discount) || Number(discount) < 0 || Number(discount) > 100) {
            (0, responseUtil_1.sendResponse)(res, false, "Discount must be a number between 0 and 100.", StatusCode_1.StatusCode.BAD_REQUEST);
            return;
        }
    }
    next();
};
exports.validateAddSubscription = validateAddSubscription;
