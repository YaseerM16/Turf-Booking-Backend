"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SubscriptionPlan = void 0;
class SubscriptionPlan {
    constructor(_id, name, price, duration, features, isActive = true, isDelete = false, discount, createdAt, updatedAt) {
        this._id = _id;
        this.name = name;
        this.price = price;
        this.duration = duration;
        this.features = features;
        this.isActive = isActive;
        this.isDelete = isDelete;
        this.discount = discount;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }
}
exports.SubscriptionPlan = SubscriptionPlan;
