import mongoose from "mongoose";
import ChatRoom from "../database/models/ChatRoomModel";
import MessageModel from "../database/models/MessageModel";
import { Server, Socket } from "socket.io"
import Message from "../database/models/MessageModel";


export const socketHandler = (io: Server) => {
    io.on("connection", (socket: Socket) => {

        socket.on("joinRoom", (roomId) => {
            socket.join(roomId);
            console.log("User Joined the Chat Room :)", roomId);
        })

        socket.on("sendMessage", async (data: any) => {
            try {
                const { roomId, senderId, sender, receiverId, content } = data;
                // Validate the roomId
                if (!mongoose.Types.ObjectId.isValid(roomId)) {
                    console.log("Invalid roomId:", roomId);
                    return;
                }

                const room = await ChatRoom.findById(roomId).populate({
                    path: 'companyId',
                    select: 'companyname companyemail phone profilePicture', // Specify the fields to include (or exclude)
                }).populate({
                    path: 'userId',
                    select: 'name email phone profilePicture', // Specify the fields to include (or exclude)
                })
                    .exec();

                if (!room) {
                    console.log("Chat Room not found:", roomId);
                    return;
                }

                // Validate message fields
                if (!senderId || !receiverId || !content) {
                    console.log("Invalid or missing data of senderId or receiverId or message :(");
                    return;
                }

                const incrementField = sender === "user" ? "isReadCc" : "isReadUc";

                await ChatRoom.updateOne(
                    { _id: roomId },
                    {
                        $set: { lastMessage: content },
                        $inc: { [incrementField]: 1 },
                    }
                );

                const newMessage = new Message({
                    roomId,
                    receiverId,
                    senderId,
                    content,
                    isRead: false,
                    timestamp: new Date(),
                });

                const savedMessage = await newMessage.save();

                io.to(data.roomId).emit("receiveMessage", savedMessage)

                // Emit a notification to the receiver (real-time notification)
                io.emit("newNotification", {
                    room,
                    receiverId,
                    content,
                    timestamp: savedMessage.updatedAt,
                });
            } catch (error) {
                console.log("Error on Send the Message :", error);
            }
        })
    })
}
// console.log("Message saved to MongoDB:", savedMessage);

// // Calculate unread message counts for the receiver
// const unreadMessageCount = await Message.countDocuments({
//     receiverId,
//     isRead: false,
// });

// console.log(`Unread messages for receiver ${receiverId}:`, unreadMessageCount);

// if (receiver === "Doctor") {

//     io.emit("updateDoctorUnreadCount", unreadMessageCount);
// } else {

//     io.emit("updateUnreadCount", unreadMessageCount);
// }