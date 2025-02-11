import { Schema, model } from "mongoose";

const SubscriptionSchema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true }, // User who subscribed
    planId: { type: Schema.Types.ObjectId, ref: "SubscriptionPlan", required: true }, // Subscribed plan
    status: { type: String, enum: ["active", "expired", "canceled"], default: "active" },
    startDate: { type: Date, default: Date.now },
    endDate: { type: Date, required: true }, // Auto-calculated based on plan duration
    autoRenewal: { type: Boolean, default: false }, // If user wants auto-renewal
    paymentId: { type: String, required: true }, // Razorpay transaction ID
}, { timestamps: true });

export const Subscription = model("Subscription", SubscriptionSchema);
