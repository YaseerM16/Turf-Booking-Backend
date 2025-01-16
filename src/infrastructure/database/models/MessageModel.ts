import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
    senderId: {
        type: String,
        equired: true
    },
    receiverId: {
        type: String,
        required: true,
    },
    roomId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ChatRoom',
        required: true,
    },
    content: {
        type: String,
        required: true,
    },
    isRead: {
        type: Boolean,
        default: false,
    },
},
    {
        timestamps: true
    }
);

const Message = mongoose.model('Message', messageSchema);

export default Message;