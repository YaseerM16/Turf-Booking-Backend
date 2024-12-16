import { ObjectId } from "mongoose";

export class Payment {
    constructor(
        public bookingId: ObjectId | string,          // ID of the booking related to the payment
        public userId: ObjectId | string,             // ID of the user making the payment
        public amount: number,                        // Total payment amount
        public paymentStatus: 'pending' | 'completed' | 'failed', // Payment status
        public paymentMethod: string,                 // Payment method (e.g., 'PayU', 'Razorpay', etc.)
        public paymentTransactionId: string,         // Transaction ID from the payment gateway
        public paymentDate: Date,                     // Date of the payment
        public isRefunded: boolean,                   // Whether the payment has been refunded
        public refundTransactionId: string | undefined,  // Transaction ID for refund, if applicable
        public refundDate: Date | undefined,          // Refund date, if applicable
        public userDetails: {                         // User details (can be fetched from the user entity)
            name: string;
            email: string;
            phone: string;
        },
        public _id?: ObjectId | string,
    ) { }
}
