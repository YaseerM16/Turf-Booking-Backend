"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ErrorResponse = void 0;
class ErrorResponse extends Error {
    constructor(message, status = 500) {
        super(message);
        this.status = status;
    }
}
exports.ErrorResponse = ErrorResponse;
