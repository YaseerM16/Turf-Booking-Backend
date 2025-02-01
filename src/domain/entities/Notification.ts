import { ObjectId } from "mongoose";

export class Notification {
    constructor(
        public _id: ObjectId | string,
        public userId: ObjectId | string, // User receiving the notification
        public roomId: ObjectId | string,
        public companyId: ObjectId | string,
        public companyname: string,
        public unreadUserCount: number, // Unread messages for the user
        public unreadCompanyCount: number, // Unread messages for the company
        public userLastMessage: string | null, // Last message from the user
        public companyLastMessage: string | null, // Last message from the company
        public updatedAt: Date,
        public user: {
            name: string;
            email: string;
            phone: string;
            profilePicture: string;
        },
        public company: {
            companyname: string;
            companyEmail: string;
            phone: string;
            profilePicture: string;
        }
    ) { }
}
