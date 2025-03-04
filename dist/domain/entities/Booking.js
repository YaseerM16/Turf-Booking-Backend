"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Booking = void 0;
class Booking {
    constructor(_id, userId, companyId, turfId, selectedSlots, // Updated with `fromTime`, `toTime`, `date`, and `day`
    totalAmount, status, paymentStatus, paymentMethod, paymentTransactionId, paymentDate, bookingDate, isRefunded, userDetails, isActive, refundTransactionId, refundDate) {
        this._id = _id;
        this.userId = userId;
        this.companyId = companyId;
        this.turfId = turfId;
        this.selectedSlots = selectedSlots;
        this.totalAmount = totalAmount;
        this.status = status;
        this.paymentStatus = paymentStatus;
        this.paymentMethod = paymentMethod;
        this.paymentTransactionId = paymentTransactionId;
        this.paymentDate = paymentDate;
        this.bookingDate = bookingDate;
        this.isRefunded = isRefunded;
        this.userDetails = userDetails;
        this.isActive = isActive;
        this.refundTransactionId = refundTransactionId;
        this.refundDate = refundDate;
    }
}
exports.Booking = Booking;
