import { ObjectId } from "mongoose";

export class Subscription {
    constructor(
        public _id: ObjectId | string,
        public userId: ObjectId | string,
        public planId: ObjectId | string,
        public status: "active" | "expired" | "canceled" = "active",
        public startDate: Date,
        public endDate: Date,
        public paymentId: string,
        public createdAt?: Date,
        public updatedAt?: Date
    ) { }
}
