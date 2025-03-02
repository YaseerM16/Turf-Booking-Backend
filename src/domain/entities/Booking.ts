import { ObjectId } from "mongoose";

export class Booking {
    constructor(
        public _id: ObjectId | string,
        public userId: ObjectId | string,
        public companyId: ObjectId | string,
        public turfId: ObjectId | string,
        public selectedSlots: {
            slot: any;
            price: any;
            _id: any; fromTime: Date; toTime: Date; date: Date; day: string
        }[],  // Updated with `fromTime`, `toTime`, `date`, and `day`
        public totalAmount: number,
        public status: 'pending' | 'confirmed' | 'cancelled' | 'completed',
        public paymentStatus: 'pending' | 'completed' | 'failed',
        public paymentMethod: string,
        public paymentTransactionId: string,
        public paymentDate: Date | null,
        public bookingDate: Date,
        public isRefunded: boolean,
        public userDetails: {
            name: string;
            email: string;
            phone: string;
        },
        public isActive: boolean,
        public refundTransactionId?: string,
        public refundDate?: Date,
    ) { }
}
