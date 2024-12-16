import { ObjectId } from "mongoose";

export class Slot {
    constructor(
        public turfId: string,
        public day: string,
        public date: Date,
        public slot: string,
        public isBooked: boolean = false,
        public _id?: ObjectId,

    ) { }
}