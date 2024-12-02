import { ObjectId } from "mongoose";

export class Turf {
    constructor(
        public companyId: ObjectId | string,
        public turfName: string,
        public description: string,
        public turfSize: string,
        public turfType: string,
        public price: number,
        public images: string[],
        public facilities: string[],
        public location: { latitude: number; longitude: number },
        public workingSlots: {
            fromTime: string;
            toTime: string;
            workingDays: string[];
        },
        public isDelete?: boolean,
        public isActive?: boolean,
        public isBlocked?: boolean,
        public createdAt?: Date,
        public updatedAt?: Date,
        public _id?: ObjectId,
    ) { }
}
