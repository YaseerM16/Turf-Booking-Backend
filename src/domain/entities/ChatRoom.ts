import { ObjectId } from "mongoose";

export class ChatRoom {
    constructor(
        public _id: ObjectId | string,
        public userId: ObjectId | string,
        public companyId: ObjectId | string,
        public lastMessage: string | null = null,
        public isReadUc: number = 0,
        public isReadDc: number = 0,
        public createdAt: Date = new Date(),
        public updatedAt: Date = new Date() // Optional if you want to track updates
    ) { }
}
