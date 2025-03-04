"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Subscription = void 0;
const mongoose_1 = require("mongoose");
const SubscriptionSchema = new mongoose_1.Schema({
    userId: { type: mongoose_1.Schema.Types.ObjectId, ref: "User", required: true }, // User who subscribed
    planId: { type: mongoose_1.Schema.Types.ObjectId, ref: "SubscriptionPlan", required: true }, // Subscribed plan
    status: { type: String, enum: ["active", "expired", "canceled"], default: "active" },
    startDate: { type: Date, default: Date.now },
    endDate: { type: Date, required: true }, // Auto-calculated based on plan duration
    paymentId: { type: String, required: true }, // Razorpay transaction ID
}, { timestamps: true });
exports.Subscription = (0, mongoose_1.model)("Subscription", SubscriptionSchema);
