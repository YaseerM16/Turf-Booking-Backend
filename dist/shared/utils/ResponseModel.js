"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResponseModel = void 0;
class ResponseModel {
    constructor(success, message, data) {
        this.success = success;
        this.message = message;
        this.data = data;
    }
}
exports.ResponseModel = ResponseModel;
