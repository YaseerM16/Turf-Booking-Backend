import { ObjectId } from "mongoose"

export class Wallet {
    constructor(
        public _id: ObjectId | string,
        public userId: ObjectId | string,
        public walletBalance: number,
        public walletTransaction: {
            transactionDate: Date;
            transactionAmount: number;
            transactionType: string;
            transactionMethod: string;
        }[]
    ) { }
}