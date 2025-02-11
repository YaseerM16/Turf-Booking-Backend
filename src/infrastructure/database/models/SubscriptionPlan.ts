import { Schema, model } from "mongoose";

const SubscriptionPlanSchema = new Schema({
    name: { type: String, required: true, unique: true }, // Plan name (e.g., "Basic", "Premium")
    price: { type: Number, required: true }, // Cost of the plan
    duration: { type: String, enum: ["monthly", "yearly"], required: true }, // Duration type
    features: [{ type: String }], // List of features included in the plan
    isActive: { type: Boolean, default: true }, // Enable/disable plan
}, { timestamps: true });

export const SubscriptionPlan = model("SubscriptionPlan", SubscriptionPlanSchema);
