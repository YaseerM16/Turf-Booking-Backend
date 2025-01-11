import mongoose from "mongoose";

export const SlotModel = mongoose.model("Slot", new mongoose.Schema({
    turfId: { type: mongoose.Schema.Types.ObjectId, ref: "Turf", required: true },
    day: { type: String, required: true }, // E.g., "Sunday"
    date: { type: Date, required: true }, // E.g., "2024-12-15"
    slot: { type: String, required: true },
    isBooked: { type: Boolean, default: false },
    isUnavail: { type: Boolean, default: false },
    isExpired: { type: Boolean, default: false },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "Clean-User", required: false, default: null }, // New field
    isCancelled: { type: Boolean, required: true, default: false },  // Slot cancellation status
    isRefunded: { type: Boolean, default: false },  // Refund status for the individual slot
    refundTransactionId: { type: String },  // Refund transaction ID for the slot
    refundDate: { type: Date }  // Refund date for the slot
}));
