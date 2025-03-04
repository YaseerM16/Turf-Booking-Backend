"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Payment = void 0;
class Payment {
    constructor(bookingId, // ID of the booking related to the payment
    userId, // ID of the user making the payment
    amount, // Total payment amount
    paymentStatus, // Payment status
    paymentMethod, // Payment method (e.g., 'PayU', 'Razorpay', etc.)
    paymentTransactionId, // Transaction ID from the payment gateway
    paymentDate, // Date of the payment
    isRefunded, // Whether the payment has been refunded
    refundTransactionId, // Transaction ID for refund, if applicable
    refundDate, // Refund date, if applicable
    userDetails, _id) {
        this.bookingId = bookingId;
        this.userId = userId;
        this.amount = amount;
        this.paymentStatus = paymentStatus;
        this.paymentMethod = paymentMethod;
        this.paymentTransactionId = paymentTransactionId;
        this.paymentDate = paymentDate;
        this.isRefunded = isRefunded;
        this.refundTransactionId = refundTransactionId;
        this.refundDate = refundDate;
        this.userDetails = userDetails;
        this._id = _id;
    }
}
exports.Payment = Payment;
