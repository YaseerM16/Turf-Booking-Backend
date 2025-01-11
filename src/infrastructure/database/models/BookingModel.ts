import mongoose, { Schema } from "mongoose";
import { Booking } from "../../../domain/entities/Booking";


const BookingSchema = new Schema<Booking>({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    companyId: { type: Schema.Types.ObjectId, ref: 'Company', required: true },
    turfId: { type: Schema.Types.ObjectId, ref: 'Turf', required: true },
    selectedSlots: [{
        _id: { type: String, required: true },  // Unique slot ID
        turfId: { type: String, required: true },  // Turf ID associated with the slot
        day: { type: String, required: true },  // Day of the week
        date: { type: Date, required: true },  // Date of the booking
        slot: { type: String, required: true },  // Time slot in "HH:MM - HH:MM" format
        isBooked: { type: Boolean, required: true, default: false },  // Slot booking status
        isCancelled: { type: Boolean, required: true, default: false },  // Slot cancellation status
        isRefunded: { type: Boolean, default: false },  // Refund status for the individual slot
        refundTransactionId: { type: String },  // Refund transaction ID for the slot
        refundDate: { type: Date },  // Refund date for the slot
        price: { type: Number, required: true },  // Price of the slot
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
})


const BookingModel = mongoose.model<Booking>("Booking", BookingSchema);

export default BookingModel;