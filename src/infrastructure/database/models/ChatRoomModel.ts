import mongoose from "mongoose";

const chatRoomSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Clean-User",
        required: true,
    },
    companyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Company",
        required: true,
    },
    lastMessage: {
        type: String,
        default: null,
    },
    isReadUc: {
        type: Number,
        default: 0,
    },
    isReadDc: {
        type: Number,
        default: 0,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
},
    {
        timestamps: true,
    }
);

const ChatRoom = mongoose.model("ChatRoom", chatRoomSchema);

export default ChatRoom;