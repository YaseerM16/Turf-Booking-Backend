"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Subscription = void 0;
class Subscription {
    constructor(_id, userId, planId, status = "active", startDate, endDate, paymentId, createdAt, updatedAt) {
        this._id = _id;
        this.userId = userId;
        this.planId = planId;
        this.status = status;
        this.startDate = startDate;
        this.endDate = endDate;
        this.paymentId = paymentId;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }
}
exports.Subscription = Subscription;
