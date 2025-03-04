"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SubscriptionPlan = void 0;
const mongoose_1 = require("mongoose");
const SubscriptionPlanSchema = new mongoose_1.Schema({
    name: { type: String, required: true, unique: true },
    price: { type: Number, required: true },
    duration: { type: String, enum: ["monthly", "yearly"], required: true },
    features: { type: String },
    isActive: { type: Boolean, default: true },
    discount: { type: Number, default: 0 }, // New discount field (default 0)
    isDelete: { type: Boolean, default: false },
}, { timestamps: true });
exports.SubscriptionPlan = (0, mongoose_1.model)("SubscriptionPlan", SubscriptionPlanSchema);
