"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendResponse = void 0;
const ResponseModel_1 = require("./ResponseModel");
const sendResponse = (res, success, message, statusCode, additionalFields) => {
    const response = new ResponseModel_1.ResponseModel(success, message, additionalFields);
    res.status(statusCode).json(response);
};
exports.sendResponse = sendResponse;
