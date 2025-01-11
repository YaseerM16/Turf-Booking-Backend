import { ObjectId } from "mongoose";

export class Turf {
    constructor(
        public companyId: ObjectId | string,
        public turfName: string,
        public address: string,
        public description: string,
        public turfSize: string,
        public turfType: string,
        public price: number,
        public images: string[],
        public facilities: string[],
        public supportedGames: string[],
        public location: { latitude: number; longitude: number },
        public workingSlots: {
            fromTime: string; // Common start time
            toTime: string;   // Common end time
            workingDays: {
                price: number;
                day: string;
                fromTime: string;
                toTime: string;
            }[];
        },
        public generatedSlots?: {
            fromDate: Date;
            toDate: Date;
        },
        public isDelete?: boolean,
        public isActive?: boolean,
        public isBlocked?: boolean,
        public createdAt?: Date,
        public updatedAt?: Date,
        public _id?: ObjectId,
    ) { }
}

