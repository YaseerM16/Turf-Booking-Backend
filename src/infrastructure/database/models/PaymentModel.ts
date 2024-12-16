import mongoose, { Schema } from "mongoose";
import { Payment } from "../../../domain/entities/Payment";


const paymentSchema = new Schema<Payment>({
    bookingId: { type: Schema.Types.ObjectId, ref: 'Booking', required: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    amount: { type: Number, required: true },
    paymentStatus: { type: String, enum: ['pending', 'completed', 'failed'], required: true },
    paymentMethod: { type: String, required: true },
    paymentTransactionId: { type: String, required: true },
    paymentDate: { type: Date, default: Date.now },
    isRefunded: { type: Boolean, default: false },
    refundTransactionId: { type: String },
    refundDate: { type: Date },
    userDetails: {
        name: { type: String, required: true },
        email: { type: String, required: true },
        phone: { type: String, required: true }
    },
})


const PaymentModel = mongoose.model<Payment>("Payment", paymentSchema);

export default PaymentModel;