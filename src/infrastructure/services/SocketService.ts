import mongoose from "mongoose";
import ChatRoom from "../database/models/ChatRoomModel";
import MessageModel from "../database/models/MessageModel";
import { Server, Socket } from "socket.io"
import Message from "../database/models/MessageModel";
import { uploadMiddleware, uploadToS3 } from "../multer/multerConfig";


export const socketHandler = (io: Server) => {
    const onlineUsers: Record<string, Set<string>> = {}; // { roomId: Set of userIds }

    io.on("connection", (socket: Socket) => {

        socket.on("userOnline", ({ roomId, userId }) => {
            console.log("UserOnline called :");

            if (!onlineUsers[roomId]) {
                onlineUsers[roomId] = new Set();
            }
            onlineUsers[roomId].add(userId);
            io.to(roomId).emit("updateOnlineStatus", Array.from(onlineUsers[roomId])); // Send online users list
        });

        socket.on("userOffline", ({ roomId, userId }) => {
            console.log("UserOffline called :");

            if (onlineUsers[roomId]) {
                onlineUsers[roomId].delete(userId);

                if (onlineUsers[roomId].size === 0) {
                    delete onlineUsers[roomId];
                    io.to(roomId).emit("updateOnlineStatus", []); // Send empty array when no users are online
                } else {
                    io.to(roomId).emit("updateOnlineStatus", Array.from(onlineUsers[roomId]));
                }
            }
        });

        socket.on("deleteNotify", (data) => {
            io.to(data.roomId).emit("messageDeleted", data.message)
        })


        socket.on("joinRoom", (roomId) => {
            socket.join(roomId);
            console.log("User Joined the Chat Room :)", roomId);
        })

        socket.on("sendMessage", async (data: any) => {
            try {
                const { roomId, senderId, sender, receiverId, content, isImage } = data;
                // Validate the roomId
                if (!mongoose.Types.ObjectId.isValid(roomId)) {
                    console.log("Invalid roomId:", roomId);
                    return;
                }
                if (isImage) {

                    const imageUrls = await Promise.all(
                        content.map(async (file: any) => {
                            // console.log("FIle :", file);

                            return await uploadToS3(file.buffer, file.originalname, file.mimetype);
                        })
                    );

                    console.log("IMage URLS :", imageUrls);


                    const room = await ChatRoom.findById(roomId).populate({
                        path: 'companyId',
                        select: 'companyname companyemail phone profilePicture', // Specify the fields to include (or exclude)
                    }).populate({
                        path: 'userId',
                        select: 'name email phone profilePicture', // Specify the fields to include (or exclude)
                    })

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

                    for (const imageUrl of imageUrls) {
                        const newMessage = new Message({
                            roomId,
                            receiverId,
                            senderId,
                            content: imageUrl, // The image URL as the message content
                            isRead: false,
                            timestamp: new Date(),
                            isImage: true, // Flag to indicate this message is an image
                        });

                        const savedMessage = await newMessage.save();
                        await ChatRoom.updateOne(
                            { _id: roomId },
                            {
                                $set: { lastMessage: imageUrl },
                                $inc: { [incrementField]: 1 },
                            }
                        );

                        // Emit notifications
                        io.emit("newNotification", {
                            room,
                            receiverId,
                            content: imageUrl,
                            timestamp: savedMessage.updatedAt,
                        });

                        io.to(data.roomId).emit("receiveMessage", savedMessage);
                    }

                } else {

                    // Handle text messages (if content is not binary)
                    // Your usual logic for text messages here
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
                    // Emit a notification to the receiver (real-time notification)
                    io.emit("newNotification", {
                        room,
                        receiverId,
                        content,
                        timestamp: savedMessage.updatedAt,
                    });
                    io.to(data.roomId).emit("receiveMessage", savedMessage)
                }

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