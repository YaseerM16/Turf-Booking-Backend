import { Schema, model } from "mongoose";
import { SubscriptionPlan as planEntity } from "../../../domain/entities/SubscriptionPlan"


const SubscriptionPlanSchema = new Schema<planEntity>({
    name: { type: String, required: true, unique: true },
    price: { type: Number, required: true },
    duration: { type: String, enum: ["monthly", "yearly"], required: true },
    features: { type: String },
    isActive: { type: Boolean, default: true },
    discount: { type: Number, default: 0 }, // New discount field (default 0)
    isDelete: { type: Boolean, default: false },
}, { timestamps: true });

export const SubscriptionPlan = model<planEntity>("SubscriptionPlan", SubscriptionPlanSchema);
