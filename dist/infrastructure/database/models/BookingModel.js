"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
const BookingSchema = new mongoose_1.Schema({
    userId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true },
    companyId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Company', required: true },
    turfId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Turf', required: true },
    selectedSlots: [{
            _id: { type: String, required: true }, // Unique slot ID
            turfId: { type: String, required: true }, // Turf ID associated with the slot
            day: { type: String, required: true }, // Day of the week
            date: { type: Date, required: true }, // Date of the booking
            slot: { type: String, required: true }, // Time slot in "HH:MM - HH:MM" format
            isBooked: { type: Boolean, required: true, default: false }, // Slot booking status
            isCancelled: { type: Boolean, required: true, default: false }, // Slot cancellation status
            isRefunded: { type: Boolean, default: false }, // Refund status for the individual slot
            refundTransactionId: { type: String }, // Refund transaction ID for the slot
            refundDate: { type: Date }, // Refund date for the slot
            price: { type: Number, required: true }, // Price of the slot
        }],
    totalAmount: { type: Number, required: true },
    status: { type: String, enum: ['pending', 'confirmed', 'cancelled', 'completed'], required: true },
    paymentStatus: { type: String, enum: ['pending', 'completed', 'failed'], required: true },
    paymentMethod: { type: String, required: true },
    paymentTransactionId: { type: String, required: true },
    paymentDate: { type: Date, default: null },
    bookingDate: { type: Date, default: Date.now },
    isRefunded: { type: Boolean, default: false },
    userDetails: {
        name: { type: String, required: true },
        email: { type: String, required: true },
        phone: { type: String, required: true }
    },
    isActive: { type: Boolean, default: true },
    refundTransactionId: { type: String },
    refundDate: { type: Date }
}, {
    timestamps: true,
});
const BookingModel = mongoose_1.default.model("Booking", BookingSchema);
exports.default = BookingModel;
