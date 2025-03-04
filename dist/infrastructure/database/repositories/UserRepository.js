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
exports.MongoUserRepository = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const errors_1 = require("../../../shared/utils/errors");
const BookingModel_1 = __importDefault(require("../models/BookingModel"));
const PaymentModel_1 = __importDefault(require("../models/PaymentModel"));
const TurfModel_1 = __importDefault(require("../models/TurfModel"));
const UserModel_1 = __importDefault(require("../models/UserModel"));
const WalletModel_1 = __importDefault(require("../models/WalletModel"));
const SlotModel_1 = require("../models/SlotModel");
const ChatRoomModel_1 = __importDefault(require("../models/ChatRoomModel"));
const StatusCode_1 = require("../../../shared/enums/StatusCode");
const MessageModel_1 = __importDefault(require("../models/MessageModel"));
class MongoUserRepository {
    findById(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const userDoc = yield UserModel_1.default.findById(userId).populate("subscriptionPlan");
                return userDoc ? userDoc : null;
            }
            catch (error) {
                throw new errors_1.ErrorResponse(error.message, error.status);
            }
        });
    }
    findBlockedUsers() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const blockedUsers = yield UserModel_1.default.countDocuments({ isActive: false });
                return blockedUsers;
            }
            catch (error) {
                throw new errors_1.ErrorResponse(error.message, error.status);
            }
        });
    }
    googleRegister(email, username) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const user = {
                    name: username,
                    email: email,
                };
                return this.create(user);
            }
            catch (error) {
                throw new errors_1.ErrorResponse(error.message, error.status);
            }
        });
    }
    findByEmail(email) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const userDoc = yield UserModel_1.default.findOne({ email }).populate("subscriptionPlan");
                return userDoc ? userDoc : null;
            }
            catch (error) {
                throw new errors_1.ErrorResponse(error.message, error.status);
            }
        });
    }
    create(user) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const userDoc = new UserModel_1.default(user);
                yield userDoc.save();
                console.log("CReated User in UserRepo :)");
                return userDoc;
            }
            catch (error) {
                console.log("Trhwoign Err in UserRepo :", error);
                throw new errors_1.ErrorResponse(error.message, error.status);
            }
        });
    }
    update(id, value) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const updatedUser = yield UserModel_1.default.findByIdAndUpdate(id, value, {
                    new: true,
                    fields: "-password"
                }).populate("subscriptionPlan");
                return updatedUser;
            }
            catch (error) {
                console.log("Errro trew from UseRespo :", error);
                throw new errors_1.ErrorResponse(error.message, error.status);
            }
        });
    }
    getAllTurfs(queryObj) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // console.log("QUERYObj in UserRepo : ", queryObj);
                const { page, limit, searchQry, filter } = queryObj;
                // Base query
                const query = {
                    isDelete: false,
                    isBlocked: false,
                };
                // Search query
                if (searchQry) {
                    query.turfName = { $regex: searchQry, $options: "i" }; // Case-insensitive search
                }
                // Apply type filter
                if (filter === null || filter === void 0 ? void 0 : filter.type) {
                    query.turfType = { $in: filter.type.split(",") };
                }
                // Apply size filter
                if (filter === null || filter === void 0 ? void 0 : filter.size) {
                    query.turfSize = { $in: filter.size.split(",") };
                }
                // Apply price filter
                if (filter === null || filter === void 0 ? void 0 : filter.price) {
                    const priceRanges = filter.price.split(",").map((range) => {
                        const [min, max] = range.split("-").map(Number);
                        return { price: { $gte: min, $lte: max } };
                    });
                    // Combine price ranges with $or
                    query.$or = priceRanges;
                }
                // console.log("MongoDB Query:", JSON.stringify(query, null, 2));
                // Pagination options
                const options = {
                    skip: (page - 1) * limit,
                    limit: parseInt(limit, 10),
                };
                const totalTurfs = yield TurfModel_1.default.countDocuments(query);
                const turfs = yield TurfModel_1.default.find(query)
                    .skip(options.skip || 0)
                    .limit(options.limit || 0);
                return { turfs: turfs, totalTurfs };
            }
            catch (error) {
                throw new errors_1.ErrorResponse(error.message, error.status);
            }
        });
    }
    getTurfById(turfId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const turfs = yield TurfModel_1.default.findById(turfId);
                return turfs;
            }
            catch (error) {
                throw new errors_1.ErrorResponse(error.message, error.status);
            }
        });
    }
    getSlotByDay(turfId, day, date) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const queryDate = new Date(date); // Assuming `date` is in 'YYYY-MM-DD' format
                const slots = yield SlotModel_1.SlotModel.find({ turfId, day, date: queryDate, isExpired: false }).exec();
                // console.log("SLOTS : ", slots);
                const turf = yield TurfModel_1.default.findById(turfId).exec();
                if (!turf) {
                    throw new Error(`Turf with ID ${turfId} not found`);
                }
                // Find the working day in the workingDays array
                const workingDay = turf.workingSlots.workingDays.find((workingDay) => workingDay.day === day);
                const price = workingDay ? workingDay.price : null; // Get the price if the working day exists
                return { slots: slots, price };
            }
            catch (error) {
                throw new errors_1.ErrorResponse(error.message, error.status);
            }
        });
    }
    bookTheSlots(bookingDets) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const slots = bookingDets.selectedSlots;
                const user = yield UserModel_1.default.findById(bookingDets === null || bookingDets === void 0 ? void 0 : bookingDets.userId);
                if (!user) {
                    throw new errors_1.ErrorResponse("User not found.", 404);
                }
                for (const slot of slots) {
                    const updatedSlot = yield SlotModel_1.SlotModel.findOneAndUpdate({ _id: slot._id, isBooked: false }, // Ensure the slot isn't already booked
                    {
                        $set: { isBooked: true, userId: bookingDets.userId } // Mark as booked and add userId
                    }, { new: true } // Return the updated document
                    );
                    if (!updatedSlot) {
                        throw new errors_1.ErrorResponse(`Slot with ID ${slot._id} is already booked or doesn't exist.`, 400);
                    }
                }
                const userDet = {
                    name: user === null || user === void 0 ? void 0 : user.name,
                    email: user === null || user === void 0 ? void 0 : user.email,
                    phone: (user === null || user === void 0 ? void 0 : user.phone) || "Not Provided"
                };
                bookingDets.userDetails = userDet;
                const newBooking = new BookingModel_1.default(bookingDets);
                const savedBooking = yield newBooking.save();
                const populatedBooking = yield BookingModel_1.default.findById(savedBooking._id).populate('turfId');
                const payment = {
                    bookingId: savedBooking._id,
                    userId: bookingDets.userId,
                    amount: bookingDets.totalAmount,
                    paymentStatus: bookingDets.paymentStatus,
                    paymentMethod: bookingDets.paymentMethod,
                    paymentTransactionId: bookingDets.paymentTransactionId,
                    paymentDate: bookingDets.bookingDate,
                    isRefunded: false,
                    refundTransactionId: undefined,
                    refundDate: undefined,
                    userDetails: {
                        name: bookingDets.userDetails.name,
                        email: bookingDets.userDetails.email,
                        phone: bookingDets.userDetails.phone || "Not provided"
                    }
                };
                const paymentProcess = new PaymentModel_1.default(payment);
                const paymentSaved = yield paymentProcess.save();
                // console.log("Returning Successful form BookingUsrRepo :)");
                return {
                    success: true,
                    message: "Booking completed successfully.",
                    booking: populatedBooking,
                };
            }
            catch (error) {
                throw new errors_1.ErrorResponse(error.message, error.status);
            }
        });
    }
    createWallet(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const existingWallet = yield WalletModel_1.default.findOne({ userId });
                if (existingWallet) {
                    return {
                        success: true,
                        message: "Wallet Already Existed for this User..!!",
                        wallet: existingWallet,
                    };
                }
                // Create a new wallet
                const wallet = new WalletModel_1.default({
                    userId,
                    walletBalance: 0, // Initial balance is 0
                    walletTransaction: [], // Initialize with no transactions
                });
                // Save the wallet in the database
                const savedWallet = yield wallet.save();
                return {
                    success: true,
                    message: "Wallet created successfully",
                    wallet: savedWallet,
                };
            }
            catch (error) {
                throw new errors_1.ErrorResponse(error.message, error.status);
            }
        });
    }
    getBookingByUserId(userId, page, limit) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const user = yield UserModel_1.default.findById(userId);
                if (!user) {
                    throw new errors_1.ErrorResponse("User not found.", 404);
                }
                const skip = (page - 1) * limit;
                const bookings = yield BookingModel_1.default.find({ userId }).populate({
                    path: 'turfId',
                    select: 'turfName address price location images',
                })
                    .sort({ createdAt: -1 })
                    .skip(skip)
                    .limit(limit);
                const totalBookings = yield BookingModel_1.default.countDocuments({ userId });
                // Ensure `bookings` is always an array, even if empty
                return { bookings, totalBookings };
            }
            catch (error) {
                console.error("Error fetching bookings for user:", userId, error);
                throw new Error("Error fetching bookings. Please try again later.");
            }
        });
    }
    getWalletById(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const user = yield UserModel_1.default.findById(userId);
                if (!user) {
                    throw new errors_1.ErrorResponse("User not found.", 404);
                }
                const wallet = yield WalletModel_1.default.findOne({ userId });
                if (wallet)
                    return wallet;
                else
                    return null;
            }
            catch (error) {
                throw new Error("Error fetching bookings. Please try again later.");
            }
        });
    }
    cancleTheSlot(userId, slotId, bookingId) {
        return __awaiter(this, void 0, void 0, function* () {
            const session = yield mongoose_1.default.startSession();
            try {
                // Start a transaction
                session.startTransaction();
                if (!userId || !slotId) {
                    throw new errors_1.ErrorResponse("UserID or SlotID is not provided.", 400);
                }
                // Fetch the slot
                const slot = yield SlotModel_1.SlotModel.findById(slotId).session(session);
                if (!slot) {
                    throw new errors_1.ErrorResponse("Slot not found.", 404);
                }
                // Check if the user is the one who booked the slot
                if (slot.userId && slot.userId.toString() !== userId) {
                    throw new errors_1.ErrorResponse("This slot was not booked by the current user.", 403);
                }
                // Assume the slot has a field `amount` for the slot price
                // 1. Update the slot status
                slot.isBooked = false;
                slot.userId = null;
                slot.isCancelled = true;
                slot.isRefunded = true;
                slot.refundTransactionId = `refund-${new Date().getTime()}-${Math.random().toString(36).substring(2, 8)}`; // Provide an actual refund transaction ID
                slot.refundDate = new Date();
                yield slot.save({ session });
                // 2. Update the booking model
                const booking = yield BookingModel_1.default.findOne({
                    "selectedSlots._id": slotId,
                    userId: userId
                }).session(session);
                if (!booking) {
                    throw new errors_1.ErrorResponse("Booking not found for this slot.", 404);
                }
                const selectedSlot = booking.selectedSlots.find((slot) => slot._id.toString() === slotId);
                if (!selectedSlot) {
                    throw new errors_1.ErrorResponse("Slot not found in the booking.", 404);
                }
                // Convert fromTime (start time of the slot) to a Date object
                const slotDate = new Date(selectedSlot.fromTime);
                // Get the current time (convert to UTC for accuracy)
                const now = new Date();
                const utcNow = new Date(now.toISOString());
                // Check time difference
                const timeDifference = slotDate.getTime() - utcNow.getTime();
                const hoursDifference = timeDifference / (1000 * 60 * 60); // Convert ms to hours
                console.log("Slot Date:", slotDate.toISOString());
                console.log("Current Time:", utcNow.toISOString());
                console.log("Hours Difference:", hoursDifference);
                console.log("Slot Price:", selectedSlot.price);
                // Deduct 25% if cancellation is within 24 hours
                const refundAmount = hoursDifference < 24
                    ? Math.round(selectedSlot.price * 0.75)
                    : selectedSlot.price;
                0;
                if (booking.totalAmount <= 0) {
                    booking.totalAmount = 0;
                }
                booking.selectedSlots = booking.selectedSlots.map((selectedSlot) => {
                    if (selectedSlot._id === slotId) {
                        selectedSlot.isCancelled = true;
                        selectedSlot.isRefunded = true;
                        selectedSlot.refundTransactionId = "refund-transaction-id"; // Provide an actual refund transaction ID
                        selectedSlot.refundDate = new Date();
                    }
                    return selectedSlot;
                });
                yield booking.save({ session });
                // 3. Update the wallet model (credit the refund amount)
                const userWallet = yield WalletModel_1.default.findOne({ userId }).session(session);
                if (!userWallet) {
                    throw new errors_1.ErrorResponse("User wallet not found.", 404);
                }
                userWallet.walletBalance += refundAmount; // Credit the refunded slot amount dynamically
                userWallet.walletTransaction.push({
                    transactionAmount: refundAmount, // Refund amount dynamically determined
                    transactionType: "credit", // Since it's a refund, we credit the amount
                    transactionMethod: "Cancel Booking",
                    transactionDate: new Date()
                });
                yield userWallet.save({ session });
                // Commit the transaction
                yield session.commitTransaction();
                session.endSession();
                return {
                    message: "Slot cancelled and refund processed successfully.",
                    success: true,
                    refundAmount, // Return the refunded amount
                    booking, // Return the updated booking document
                };
            }
            catch (error) {
                // Abort the transaction in case of error
                yield session.abortTransaction();
                session.endSession();
                throw error; // Re-throw the error after aborting
            }
        });
    }
    checkWalletBalance(userId, total) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const wallet = yield WalletModel_1.default.findOne({ userId });
                if (!wallet) {
                    throw new errors_1.ErrorResponse("Wallet not found for the user.", 404);
                }
                const isSufficient = wallet.walletBalance >= total;
                return {
                    isSufficient,
                    currentBalance: wallet.walletBalance,
                };
            }
            catch (error) {
                console.error("Error checking wallet balance for user:", userId, error);
                throw new errors_1.ErrorResponse(error.message || "Error checking wallet balance.", error.status || 500);
            }
        });
    }
    bookSlotsByWallet(userId, bookingDets) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const user = yield UserModel_1.default.findById(userId);
                if (!user) {
                    throw new errors_1.ErrorResponse("User not found.", 404);
                }
                const userDet = {
                    name: user === null || user === void 0 ? void 0 : user.name,
                    email: user === null || user === void 0 ? void 0 : user.email,
                    phone: (user === null || user === void 0 ? void 0 : user.phone) || "Not Provided"
                };
                const slots = bookingDets.selectedSlots;
                for (const slot of slots) {
                    const updatedSlot = yield SlotModel_1.SlotModel.findOneAndUpdate({ _id: slot._id, isBooked: false }, // Ensure the slot isn't already booked
                    {
                        $set: { isBooked: true, userId: bookingDets.userId } // Mark as booked and add userId
                    }, { new: true } // Return the updated document
                    );
                    if (!updatedSlot) {
                        throw new errors_1.ErrorResponse(`Slot with ID ${slot._id} is already booked or doesn't exist.`, 400);
                    }
                }
                bookingDets.userId = userId;
                bookingDets.status = "completed";
                bookingDets.paymentMethod = "wallet";
                bookingDets.paymentDate = null;
                bookingDets.bookingDate = new Date();
                bookingDets.isRefunded = false;
                bookingDets.isActive = true;
                bookingDets.paymentStatus = 'completed';
                bookingDets.userDetails = userDet;
                const newBooking = new BookingModel_1.default(bookingDets);
                const savedBooking = yield newBooking.save();
                // 3. Update the wallet model (credit the refund amount)
                const userWallet = yield WalletModel_1.default.findOne({ userId });
                if (!userWallet) {
                    throw new errors_1.ErrorResponse("User wallet not found.", 404);
                }
                userWallet.walletBalance -= bookingDets.totalAmount; // Credit the refunded slot amount dynamically
                userWallet.walletTransaction.push({
                    transactionAmount: bookingDets.totalAmount, // Refund amount dynamically determined
                    transactionType: "debit", // Since it's a refund, we credit the amount
                    transactionMethod: "Slot Booked",
                    transactionDate: new Date()
                });
                yield userWallet.save();
                const populatedBooking = yield BookingModel_1.default.findById(savedBooking._id).populate('turfId');
                const payment = {
                    bookingId: savedBooking._id,
                    userId: bookingDets.userId,
                    amount: bookingDets.totalAmount,
                    paymentStatus: bookingDets.paymentStatus,
                    paymentMethod: bookingDets.paymentMethod,
                    paymentTransactionId: bookingDets.paymentTransactionId,
                    paymentDate: bookingDets.bookingDate,
                    isRefunded: false,
                    refundTransactionId: undefined,
                    refundDate: undefined,
                    userDetails: {
                        name: bookingDets.userDetails.name,
                        email: bookingDets.userDetails.email,
                        phone: bookingDets.userDetails.phone || "Not provided"
                    }
                };
                const paymentProcess = new PaymentModel_1.default(payment);
                const paymentSaved = yield paymentProcess.save();
                return {
                    success: true,
                    message: "Booking completed successfully.",
                    booking: populatedBooking,
                };
            }
            catch (error) {
                throw new errors_1.ErrorResponse(error.message, error.status);
            }
        });
    }
    createChatRoom(userId, companyId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!userId || !companyId) {
                    throw new errors_1.ErrorResponse("UserID or CompanyID is not provided.", StatusCode_1.StatusCode.BAD_REQUEST);
                }
                const existingRoom = yield ChatRoomModel_1.default.findOne({ userId, companyId });
                if (existingRoom) {
                    return existingRoom;
                }
                const newRoom = new ChatRoomModel_1.default({ userId, companyId });
                const savedRoom = yield newRoom.save();
                return savedRoom;
            }
            catch (error) {
                throw new errors_1.ErrorResponse(error.message, StatusCode_1.StatusCode.INTERNAL_SERVER_ERROR);
            }
        });
    }
    sendMessage(userId, companyId, data) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!userId || !companyId || !data) {
                    throw new errors_1.ErrorResponse("UserID or CompanyID or data is not provided While Trying to Send a Message ..!", StatusCode_1.StatusCode.BAD_REQUEST);
                }
                const { roomId, message } = data;
                const newMessage = new MessageModel_1.default({ senderId: userId, receiverId: companyId, roomId, content: message });
                yield newMessage.save();
                yield ChatRoomModel_1.default.findByIdAndUpdate(roomId, { lastMessage: message, createdAt: new Date().toISOString() }, { new: true });
                return newMessage;
            }
            catch (error) {
                throw new errors_1.ErrorResponse(error.message, StatusCode_1.StatusCode.INTERNAL_SERVER_ERROR);
            }
        });
    }
    getMessages(roomId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!roomId) {
                    throw new errors_1.ErrorResponse("RoomId is not provided While Trying to Get a Messages ..!", StatusCode_1.StatusCode.BAD_REQUEST);
                }
                yield ChatRoomModel_1.default.updateOne({ _id: roomId }, { $set: { isReadUc: 0 } });
                yield MessageModel_1.default.updateMany({ roomId }, { $set: { isRead: true } });
                const messages = yield MessageModel_1.default.find({ roomId })
                    .exec();
                const updatedChatRoom = yield ChatRoomModel_1.default.findById(roomId).populate({
                    path: 'companyId',
                    select: 'companyname companyemail phone profilePicture', // Specify the fields to include (or exclude)
                })
                    .exec();
                return { messages: messages, chat: updatedChatRoom };
            }
            catch (error) {
                throw new errors_1.ErrorResponse(error.message, StatusCode_1.StatusCode.INTERNAL_SERVER_ERROR);
            }
        });
    }
    getChats(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!userId)
                    throw new errors_1.ErrorResponse("UserId is not provided While Trying to Get the Chats ..!", StatusCode_1.StatusCode.BAD_REQUEST);
                const chatRooms = yield ChatRoomModel_1.default.find({ userId })
                    .sort({ createdAt: -1 }) // Sort by `createdAt` in descending order
                    .populate({
                    path: 'companyId',
                    select: 'companyname companyemail phone profilePicture', // Specify the fields to include (or exclude)
                })
                    .exec();
                return chatRooms;
            }
            catch (error) {
                throw new errors_1.ErrorResponse(error.message, StatusCode_1.StatusCode.INTERNAL_SERVER_ERROR);
            }
        });
    }
    messageDeleteEveryOne(messageId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const findMessage = yield MessageModel_1.default.findByIdAndUpdate(messageId, { deletedForSender: true }, { new: true } // Returns the updated document
                );
                if (!findMessage) {
                    throw new Error("Message not found");
                }
                const chatRoom = yield ChatRoomModel_1.default.findById(findMessage.roomId);
                if (chatRoom) {
                    const remainingMessages = yield MessageModel_1.default.find({ roomId: chatRoom._id });
                    const validMessages = remainingMessages.filter(msg => !msg.deletedForSender && !msg.deletedForReceiver);
                    if (validMessages.length > 0) {
                        const lastMessage = validMessages[validMessages.length - 1];
                        chatRoom.lastMessage = lastMessage.content;
                    }
                    else {
                        chatRoom.lastMessage = '';
                    }
                    yield chatRoom.save();
                }
                return findMessage;
            }
            catch (error) {
                throw new errors_1.ErrorResponse(error.message, StatusCode_1.StatusCode.INTERNAL_SERVER_ERROR);
            }
        });
    }
    messageDeleteForMe(messageId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const findMessage = yield MessageModel_1.default.findByIdAndUpdate(messageId, { deletedForReceiver: true }, { new: true } // Returns the updated document
                );
                if (!findMessage) {
                    throw new Error("Message not found");
                }
                const chatRoom = yield ChatRoomModel_1.default.findById(findMessage.roomId);
                if (chatRoom) {
                    const remainingMessages = yield MessageModel_1.default.find({ roomId: chatRoom._id });
                    const validMessages = remainingMessages.filter(msg => !msg.deletedForSender);
                    if (validMessages.length > 0) {
                        const lastMessage = validMessages[validMessages.length - 1];
                        chatRoom.lastMessage = lastMessage.content;
                    }
                    else {
                        chatRoom.lastMessage = ''; // No valid messages left
                    }
                    yield chatRoom.save();
                }
                return findMessage;
            }
            catch (error) {
                throw new errors_1.ErrorResponse(error.message, StatusCode_1.StatusCode.INTERNAL_SERVER_ERROR);
            }
        });
    }
    topTurfs() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const topTurfs = yield BookingModel_1.default.aggregate([
                    {
                        "$group": {
                            "_id": "$turfId",
                            "totalEarnings": { "$sum": "$totalAmount" }
                        }
                    },
                    { "$sort": { "totalEarnings": -1 } },
                    { "$limit": 4 }
                ]);
                const turfIds = topTurfs.map(item => item._id);
                const turfs = yield TurfModel_1.default.find({ _id: { $in: turfIds } })
                    .select("turfName images workingSlots turfSize turfType price");
                const result = topTurfs.map(turfData => {
                    const turf = turfs.find(t => t._id.toString() === turfData._id.toString());
                    return {
                        turfId: turfData._id,
                        totalEarnings: turfData.totalEarnings,
                        turfName: turf ? turf.turfName : "Unknown",
                        images: turf ? turf.images : [],
                        workingSlots: turf ? turf.workingSlots : [],
                        turfSize: turf ? turf.turfSize : "Unknown",
                        turfType: turf ? turf.turfType : "Unknown",
                        price: turf ? turf.price : "Unknown"
                    };
                });
                // console.log(result);
                // console.log("TIPPPS :", turfs);
                return result;
            }
            catch (error) {
                throw new errors_1.ErrorResponse(error.message, StatusCode_1.StatusCode.INTERNAL_SERVER_ERROR);
            }
        });
    }
}
exports.MongoUserRepository = MongoUserRepository;
