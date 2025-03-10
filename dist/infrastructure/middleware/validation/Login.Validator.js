"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateLogin = void 0;
const responseUtil_1 = require("../../../shared/utils/responseUtil");
const StatusCode_1 = require("../../../shared/enums/StatusCode");
const validateLogin = (req, res, next) => {
    const { email, password, name } = req.body;
    if (!email || !/\S+@\S+\.\S+/.test(email)) {
        (0, responseUtil_1.sendResponse)(res, false, "Please provide a valid email address.", StatusCode_1.StatusCode.BAD_REQUEST);
        return;
    }
    if (!password || password.length < 6) {
        (0, responseUtil_1.sendResponse)(res, false, "Password must be at least 6 characters long.", StatusCode_1.StatusCode.BAD_REQUEST);
        return;
    }
    next();
};
exports.validateLogin = validateLogin;
