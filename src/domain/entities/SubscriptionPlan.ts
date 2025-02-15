import { ObjectId } from "mongoose";

export class SubscriptionPlan {
    constructor(
        public _id: ObjectId | string,
        public name: string,
        public price: number,
        public duration: "monthly" | "yearly",
        public features: string,
        public isActive: boolean = true,
        public isDelete: boolean = false,
        public discount: number,
        public createdAt?: Date,
        public updatedAt?: Date
    ) { }
}
