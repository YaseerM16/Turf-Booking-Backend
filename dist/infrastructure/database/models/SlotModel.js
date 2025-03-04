"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SlotModel = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
exports.SlotModel = mongoose_1.default.model("Slot", new mongoose_1.default.Schema({
    turfId: { type: mongoose_1.default.Schema.Types.ObjectId, ref: "Turf", required: true },
    day: { type: String, required: true }, // E.g., "Sunday"
    date: { type: Date, required: true }, // E.g., "2024-12-15"
    slot: { type: String, required: true },
    isBooked: { type: Boolean, default: false },
    isUnavail: { type: Boolean, default: false },
    isExpired: { type: Boolean, default: false },
    userId: { type: mongoose_1.default.Schema.Types.ObjectId, ref: "Clean-User", required: false, default: null }, // New field
    isCancelled: { type: Boolean, required: true, default: false }, // Slot cancellation status
    isRefunded: { type: Boolean, default: false }, // Refund status for the individual slot
    refundTransactionId: { type: String }, // Refund transaction ID for the slot
    refundDate: { type: Date } // Refund date for the slot
}));
