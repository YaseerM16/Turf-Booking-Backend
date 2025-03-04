"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.socketHandler = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const ChatRoomModel_1 = __importDefault(require("../database/models/ChatRoomModel"));
const MessageModel_1 = __importDefault(require("../database/models/MessageModel"));
const multerConfig_1 = require("../multer/multerConfig");
const socketHandler = (io) => {
    const onlineUsers = {}; // { roomId: Set of userIds }
    io.on("connection", (socket) => {
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
                }
                else {
                    io.to(roomId).emit("updateOnlineStatus", Array.from(onlineUsers[roomId]));
                }
            }
        });
        socket.on("deleteNotify", (data) => {
            io.to(data.roomId).emit("messageDeleted", data.message);
        });
        socket.on("joinRoom", (roomId) => {
            socket.join(roomId);
            console.log("User Joined the Chat Room :)", roomId);
        });
        socket.on("sendMessage", (data) => __awaiter(void 0, void 0, void 0, function* () {
            try {
                const { roomId, senderId, sender, receiverId, content, isImage } = data;
                // Validate the roomId
                if (!mongoose_1.default.Types.ObjectId.isValid(roomId)) {
                    console.log("Invalid roomId:", roomId);
                    return;
                }
                if (isImage) {
                    const imageUrls = yield Promise.all(content.map((file) => __awaiter(void 0, void 0, void 0, function* () {
                        // console.log("FIle :", file);
                        return yield (0, multerConfig_1.uploadToS3)(file.buffer, file.originalname, file.mimetype);
                    })));
                    console.log("IMage URLS :", imageUrls);
                    const room = yield ChatRoomModel_1.default.findById(roomId).populate({
                        path: 'companyId',
                        select: 'companyname companyemail phone profilePicture', // Specify the fields to include (or exclude)
                    }).populate({
                        path: 'userId',
                        select: 'name email phone profilePicture', // Specify the fields to include (or exclude)
                    });
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
                        const newMessage = new MessageModel_1.default({
                            roomId,
                            receiverId,
                            senderId,
                            content: imageUrl, // The image URL as the message content
                            isRead: false,
                            timestamp: new Date(),
                            isImage: true, // Flag to indicate this message is an image
                        });
                        const savedMessage = yield newMessage.save();
                        yield ChatRoomModel_1.default.updateOne({ _id: roomId }, {
                            $set: { lastMessage: imageUrl },
                            $inc: { [incrementField]: 1 },
                        });
                        // Emit notifications
                        io.emit("newNotification", {
                            room,
                            receiverId,
                            content: imageUrl,
                            timestamp: savedMessage.updatedAt,
                        });
                        io.to(data.roomId).emit("receiveMessage", savedMessage);
                    }
                }
                else {
                    // Handle text messages (if content is not binary)
                    // Your usual logic for text messages here
                    const room = yield ChatRoomModel_1.default.findById(roomId).populate({
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
                    yield ChatRoomModel_1.default.updateOne({ _id: roomId }, {
                        $set: { lastMessage: content },
                        $inc: { [incrementField]: 1 },
                    });
                    const newMessage = new MessageModel_1.default({
                        roomId,
                        receiverId,
                        senderId,
                        content,
                        isRead: false,
                        timestamp: new Date(),
                    });
                    const savedMessage = yield newMessage.save();
                    // Emit a notification to the receiver (real-time notification)
                    io.emit("newNotification", {
                        room,
                        receiverId,
                        content,
                        timestamp: savedMessage.updatedAt,
                    });
                    io.to(data.roomId).emit("receiveMessage", savedMessage);
                }
            }
            catch (error) {
                console.log("Error on Send the Message :", error);
            }
        }));
    });
};
exports.socketHandler = socketHandler;
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
