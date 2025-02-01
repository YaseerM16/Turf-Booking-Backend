import { ObjectId } from "mongoose";

export class Message {
    constructor(
        public _id: ObjectId | string,
        public sender: string,
        public receiver: string,
        public senderId: ObjectId | string,
        public receiverId: ObjectId | string,
        public deletedForSender: boolean,
        public deletedForReceiver: boolean,
        public roomId: ObjectId | string,
        public content: string,
        public isRead: boolean = false,
        public createdAt: Date,
        public updatedAt: Date
    ) { }
}
