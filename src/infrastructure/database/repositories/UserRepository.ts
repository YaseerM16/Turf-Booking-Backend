import mongoose from "mongoose";
import { Payment } from "../../../domain/entities/Payment";
import { Slot } from "../../../domain/entities/Slot";
import { Turf } from "../../../domain/entities/Turf";
import { User } from "../../../domain/entities/User";
import { Wallet } from "../../../domain/entities/Wallet";
import { IUserRepository } from "../../../domain/repositories/IUserRepository";
import { ErrorResponse } from "../../../shared/utils/errors";
import BookingModel from "../models/BookingModel";
import PaymentModel from "../models/PaymentModel";
import TurfModel from "../models/TurfModel";
import UserModel from "../models/UserModel";
import WalletModel from "../models/WalletModel";
import { SlotModel } from "../models/SlotModel";
import { BalanceCheckResult } from "../../../shared/utils/interfaces";
import { ChatRoom as ChatRoomEntity } from "../../../domain/entities/ChatRoom";
import ChatRoom from "../models/ChatRoomModel";
import { StatusCode } from "../../../shared/enums/StatusCode";
import { Message } from "../../../domain/entities/Message";
import MessageModel from "../models/MessageModel";
import NotificationModel from "../models/NotificationModel";


export class MongoUserRepository implements IUserRepository {

    async findById(userId: string): Promise<User | null> {
        try {
            const userDoc = await UserModel.findById(userId)
            return userDoc ? userDoc : null
        } catch (error: any) {
            throw new ErrorResponse(error.message, error.status);
        }
    }

    async findBlockedUsers(): Promise<any> {
        try {
            const blockedUsers = await UserModel.countDocuments({ isActive: false })
            return blockedUsers
        } catch (error: any) {
            throw new ErrorResponse(error.message, error.status);
        }
    }

    async googleRegister(email: string, username: string): Promise<User | null> {
        try {
            const user = {
                name: username,
                email: email,
            }
            return this.create(user as User)
        } catch (error: any) {
            throw new ErrorResponse(error.message, error.status);
        }
    }

    async findByEmail(email: string): Promise<User | null> {
        try {
            const userDoc = await UserModel.findOne({ email })
            return userDoc ? userDoc : null
        } catch (error: any) {
            throw new ErrorResponse(error.message, error.status);
        }
    }

    async create(user: User): Promise<User> {
        try {
            const userDoc = new UserModel(user)
            await userDoc.save()

            console.log("CReated User in UserRepo :)");
            return userDoc

        } catch (error: any) {
            console.log("Trhwoign Err in UserRepo :", error);
            throw new ErrorResponse(error.message, error.status);
        }
    }
    async update(id: string, value: any): Promise<User | null> {
        try {
            // console.log("Hi firi Updat _:_", id);
            // const [jsonString] = Object.keys(value);
            // console.log("JSonStr :", jsonString);

            // const updatedDets = JSON.parse(jsonString);
            // console.log("Update Dets for Pro :", updatedDets);

            const updatedUser = await UserModel.findByIdAndUpdate(id, value, {
                new: true,
                fields: "-password"
            });
            return updatedUser
        } catch (error: any) {
            console.log("Errro trew from UseRespo :", error);

            throw new ErrorResponse(error.message, error.status);
        }
    }

    async getAllTurfs(queryObj: any): Promise<{ turfs: Turf[]; totalTurfs: number }> {
        try {
            // console.log("QUERYObj in UserRepo : ", queryObj);

            const { page, limit, searchQry, filter } = queryObj;

            // Base query
            const query: any = {
                isDelete: false,
                isBlocked: false,
            };


            // Search query
            if (searchQry) {
                query.turfName = { $regex: searchQry, $options: "i" }; // Case-insensitive search
            }

            // Apply type filter
            if (filter?.type) {
                query.turfType = { $in: filter.type.split(",") };
            }

            // Apply size filter
            if (filter?.size) {
                query.turfSize = { $in: filter.size.split(",") };
            }

            // Apply price filter
            if (filter?.price) {
                const priceRanges = filter.price.split(",").map((range: string) => {
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
            const totalTurfs = await TurfModel.countDocuments(query);

            const turfs = await TurfModel.find(query)
                .skip(options.skip)
                .limit(options.limit);

            return { turfs: turfs as unknown as Turf[], totalTurfs };
        } catch (error: any) {
            throw new ErrorResponse(error.message, error.status);
        }
    }



    async getTurfById(turfId: string): Promise<Turf | null> {
        try {
            const turfs = await TurfModel.findById(turfId)
            return turfs as unknown as Turf
        } catch (error: any) {
            throw new ErrorResponse(error.message, error.status);
        }
    }

    async getSlotByDay(turfId: string, day: string, date: string): Promise<{ slots: Slot[]; price: number | null }> {
        try {

            const queryDate = new Date(date);  // Assuming `date` is in 'YYYY-MM-DD' format


            const slots = await SlotModel.find({ turfId, day, date: queryDate, isExpired: false }).exec();
            // console.log("SLOTS : ", slots);
            const turf = await TurfModel.findById(turfId).exec();
            if (!turf) {
                throw new Error(`Turf with ID ${turfId} not found`);
            }

            // Find the working day in the workingDays array
            const workingDay = turf.workingSlots.workingDays.find((workingDay: any) => workingDay.day === day);
            const price = workingDay ? workingDay.price : null; // Get the price if the working day exists

            return { slots: slots as unknown as Slot[], price };
        } catch (error: any) {
            throw new ErrorResponse(error.message, error.status);
        }
    }

    async bookTheSlots(bookingDets: any): Promise<object> {
        try {

            const slots = bookingDets.selectedSlots
            const user = await UserModel.findById(bookingDets?.userId)

            if (!user) {
                throw new ErrorResponse("User not found.", 404);
            }

            for (const slot of slots) {
                const updatedSlot = await SlotModel.findOneAndUpdate(
                    { _id: slot._id, isBooked: false }, // Ensure the slot isn't already booked
                    {
                        $set: { isBooked: true, userId: bookingDets.userId } // Mark as booked and add userId
                    },
                    { new: true } // Return the updated document
                );

                if (!updatedSlot) {
                    throw new ErrorResponse(
                        `Slot with ID ${slot._id} is already booked or doesn't exist.`,
                        400
                    );
                }
            }

            const userDet = {
                name: user?.name,
                email: user?.email,
                phone: user?.phone || "Not Provided"
            }
            bookingDets.userDetails = userDet

            const newBooking = new BookingModel(bookingDets);
            const savedBooking = await newBooking.save();

            const populatedBooking = await BookingModel.findById(savedBooking._id).populate('turfId');

            const payment: Payment = {
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
            }

            const paymentProcess = new PaymentModel(payment);
            const paymentSaved = await paymentProcess.save();
            // console.log("Returning Successful form BookingUsrRepo :)");

            return {
                success: true,
                message: "Booking completed successfully.",
                booking: populatedBooking,
            };

        } catch (error: any) {
            throw new ErrorResponse(error.message, error.status);
        }
    }

    async createWallet(userId: string): Promise<object> {
        try {
            const existingWallet = await WalletModel.findOne({ userId });
            if (existingWallet) {
                return {
                    success: true,
                    message: "Wallet Already Existed for this User..!!",
                    wallet: existingWallet,
                };
            }

            // Create a new wallet
            const wallet = new WalletModel({
                userId,
                walletBalance: 0, // Initial balance is 0
                walletTransaction: [], // Initialize with no transactions
            });

            // Save the wallet in the database
            const savedWallet = await wallet.save();

            return {
                success: true,
                message: "Wallet created successfully",
                wallet: savedWallet,
            };
        } catch (error: any) {
            throw new ErrorResponse(error.message, error.status);
        }
    }

    async getBookingByUserId(userId: string, page: number, limit: number): Promise<{ bookings: any[]; totalBookings: number }> {
        try {
            const user = await UserModel.findById(userId);

            if (!user) {
                throw new ErrorResponse("User not found.", 404);
            }

            const skip = (page - 1) * limit;


            const bookings = await BookingModel.find({ userId }).populate({
                path: 'turfId',
                select: 'turfName address price location images',
            })
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit);



            const totalBookings = await BookingModel.countDocuments({ userId });

            // Ensure `bookings` is always an array, even if empty
            return { bookings, totalBookings };
        } catch (error) {
            console.error("Error fetching bookings for user:", userId, error);
            throw new Error("Error fetching bookings. Please try again later.");
        }
    }


    async getWalletById(userId: string): Promise<Wallet | null> {
        try {
            const user = await UserModel.findById(userId)

            if (!user) {
                throw new ErrorResponse("User not found.", 404);
            }

            const wallet = await WalletModel.findOne({ userId })

            if (wallet) return wallet
            else return null

        } catch (error) {
            throw new Error("Error fetching bookings. Please try again later.");
        }
    }

    async cancleTheSlot(userId: string, slotId: string, bookingId: string): Promise<object> {
        const session = await mongoose.startSession();

        try {
            // Start a transaction
            session.startTransaction();

            if (!userId || !slotId) {
                throw new ErrorResponse("UserID or SlotID is not provided.", 400);
            }

            // Fetch the slot
            const slot = await SlotModel.findById(slotId).session(session);
            if (!slot) {
                throw new ErrorResponse("Slot not found.", 404);
            }

            // Check if the user is the one who booked the slot
            if (slot.userId && slot.userId.toString() !== userId) {
                throw new ErrorResponse("This slot was not booked by the current user.", 403);
            }

            // Assume the slot has a field `amount` for the slot price

            // 1. Update the slot status
            slot.isBooked = false;
            slot.userId = null;
            slot.isCancelled = true;
            slot.isRefunded = true;
            slot.refundTransactionId = `refund-${new Date().getTime()}-${Math.random().toString(36).substring(2, 8)}`; // Provide an actual refund transaction ID
            slot.refundDate = new Date();
            await slot.save({ session });

            // 2. Update the booking model
            const booking = await BookingModel.findOne({
                "selectedSlots._id": slotId,
                userId: userId
            }).session(session);

            if (!booking) {
                throw new ErrorResponse("Booking not found for this slot.", 404);
            }
            const selectedSlot = booking.selectedSlots.find((slot) => slot._id.toString() === slotId);

            if (!selectedSlot) {
                throw new ErrorResponse("Slot not found in the booking.", 404);
            }

            const refundAmount = selectedSlot.price
            // Decrease the total amount for the booking
            booking.totalAmount -= refundAmount; // Adjust the amount dynamically
            booking.selectedSlots = booking.selectedSlots.map((selectedSlot: any) => {
                if (selectedSlot._id === slotId) {
                    selectedSlot.isCancelled = true;
                    selectedSlot.isRefunded = true;
                    selectedSlot.refundTransactionId = "refund-transaction-id"; // Provide an actual refund transaction ID
                    selectedSlot.refundDate = new Date();
                }
                return selectedSlot;
            });

            await booking.save({ session });

            // 3. Update the wallet model (credit the refund amount)
            const userWallet = await WalletModel.findOne({ userId }).session(session);
            if (!userWallet) {
                throw new ErrorResponse("User wallet not found.", 404);
            }

            userWallet.walletBalance += refundAmount; // Credit the refunded slot amount dynamically
            userWallet.walletTransaction.push({
                transactionAmount: refundAmount, // Refund amount dynamically determined
                transactionType: "credit", // Since it's a refund, we credit the amount
                transactionMethod: "Cancel Booking",
                transactionDate: new Date()
            });

            await userWallet.save({ session });

            // Commit the transaction
            await session.commitTransaction();
            session.endSession();

            return {
                message: "Slot cancelled and refund processed successfully.",
                success: true,
                refundAmount, // Return the refunded amount
                booking, // Return the updated booking document
            };

        } catch (error) {
            // Abort the transaction in case of error
            await session.abortTransaction();
            session.endSession();
            throw error;  // Re-throw the error after aborting
        }
    }

    async checkWalletBalance(userId: string, total: number): Promise<BalanceCheckResult> {
        try {
            const wallet = await WalletModel.findOne({ userId });

            if (!wallet) {
                throw new ErrorResponse("Wallet not found for the user.", 404);
            }

            const isSufficient = wallet.walletBalance >= total;

            return {
                isSufficient,
                currentBalance: wallet.walletBalance,
            };
        } catch (error: any) {
            console.error("Error checking wallet balance for user:", userId, error);
            throw new ErrorResponse(error.message || "Error checking wallet balance.", error.status || 500);
        }
    }

    async bookSlotsByWallet(userId: string, bookingDets: any): Promise<object> {
        try {
            const user = await UserModel.findById(userId)
            if (!user) {
                throw new ErrorResponse("User not found.", 404);

            }
            const userDet = {
                name: user?.name,
                email: user?.email,
                phone: user?.phone || "Not Provided"
            }


            const slots = bookingDets.selectedSlots

            for (const slot of slots) {
                const updatedSlot = await SlotModel.findOneAndUpdate(
                    { _id: slot._id, isBooked: false }, // Ensure the slot isn't already booked
                    {
                        $set: { isBooked: true, userId: bookingDets.userId } // Mark as booked and add userId
                    },
                    { new: true } // Return the updated document
                );

                if (!updatedSlot) {
                    throw new ErrorResponse(
                        `Slot with ID ${slot._id} is already booked or doesn't exist.`,
                        400
                    );
                }
            }

            bookingDets.userId = userId
            bookingDets.status = "completed"
            bookingDets.paymentMethod = "wallet"
            bookingDets.paymentDate = null
            bookingDets.bookingDate = new Date()
            bookingDets.isRefunded = false
            bookingDets.isActive = true
            bookingDets.paymentStatus = 'completed'
            bookingDets.userDetails = userDet

            const newBooking = new BookingModel(bookingDets);
            const savedBooking = await newBooking.save();

            // 3. Update the wallet model (credit the refund amount)
            const userWallet = await WalletModel.findOne({ userId })
            if (!userWallet) {
                throw new ErrorResponse("User wallet not found.", 404);
            }

            userWallet.walletBalance -= bookingDets.totalAmount // Credit the refunded slot amount dynamically
            userWallet.walletTransaction.push({
                transactionAmount: bookingDets.totalAmount, // Refund amount dynamically determined
                transactionType: "debit", // Since it's a refund, we credit the amount
                transactionMethod: "Slot Booked",
                transactionDate: new Date()
            });

            await userWallet.save();

            const populatedBooking = await BookingModel.findById(savedBooking._id).populate('turfId');

            const payment: Payment = {
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
            }

            const paymentProcess = new PaymentModel(payment);
            const paymentSaved = await paymentProcess.save();

            return {
                success: true,
                message: "Booking completed successfully.",
                booking: populatedBooking,
            };

        } catch (error: any) {
            throw new ErrorResponse(error.message, error.status);
        }
    }

    async createChatRoom(userId: string, companyId: string): Promise<ChatRoomEntity> {
        try {
            if (!userId || !companyId) {
                throw new ErrorResponse("UserID or CompanyID is not provided.", StatusCode.BAD_REQUEST);
            }
            const existingRoom = await ChatRoom.findOne({ userId, companyId });
            if (existingRoom) {
                return existingRoom as unknown as ChatRoomEntity
            }
            const newRoom = new ChatRoom({ userId, companyId });
            const savedRoom = await newRoom.save();
            return savedRoom as unknown as ChatRoomEntity

        } catch (error) {
            throw new ErrorResponse((error as Error).message, StatusCode.INTERNAL_SERVER_ERROR);
        }
    }

    async sendMessage(userId: string, companyId: string, data: { roomId: string, message: string }): Promise<Message> {
        try {
            if (!userId || !companyId || !data) {
                throw new ErrorResponse("UserID or CompanyID or data is not provided While Trying to Send a Message ..!", StatusCode.BAD_REQUEST);
            }

            const { roomId, message } = data

            const newMessage = new MessageModel({ senderId: userId, receiverId: companyId, roomId, content: message })
            await newMessage.save()

            await ChatRoom.findByIdAndUpdate(roomId, { lastMessage: message, createdAt: new Date().toISOString() }, { new: true })

            return newMessage as unknown as Message
        } catch (error) {
            throw new ErrorResponse((error as Error).message, StatusCode.INTERNAL_SERVER_ERROR);
        }
    }

    async getMessages(roomId: string): Promise<{ messages: Message[], chat: ChatRoomEntity } | null> {
        try {
            if (!roomId) {
                throw new ErrorResponse("RoomId is not provided While Trying to Get a Messages ..!", StatusCode.BAD_REQUEST);
            }
            await ChatRoom.updateOne({ _id: roomId }, { $set: { isReadUc: 0 } })
            await MessageModel.updateMany({ roomId }, { $set: { isRead: true } })
            const messages = await MessageModel.find({ roomId })
                .exec();

            const updatedChatRoom = await ChatRoom.findById(roomId).populate({
                path: 'companyId',
                select: 'companyname companyemail phone profilePicture', // Specify the fields to include (or exclude)
            })
                .exec();

            return { messages: messages as unknown as Message[], chat: updatedChatRoom as unknown as ChatRoomEntity }

        } catch (error) {
            throw new ErrorResponse((error as Error).message, StatusCode.INTERNAL_SERVER_ERROR);
        }
    }

    async getChats(userId: string): Promise<ChatRoomEntity[] | null> {
        try {
            if (!userId) throw new ErrorResponse("UserId is not provided While Trying to Get the Chats ..!", StatusCode.BAD_REQUEST);
            const chatRooms = await ChatRoom.find({ userId })
                .sort({ createdAt: -1 }) // Sort by `createdAt` in descending order
                .populate({
                    path: 'companyId',
                    select: 'companyname companyemail phone profilePicture', // Specify the fields to include (or exclude)
                })
                .exec();

            return chatRooms as unknown as ChatRoomEntity[]
        } catch (error) {
            throw new ErrorResponse((error as Error).message, StatusCode.INTERNAL_SERVER_ERROR);
        }
    }

    async getNotifications(userId: string): Promise<Notification[] | null> {
        try {
            if (!userId) throw new ErrorResponse("UserId is not provided While Trying to Get the Notifications ..!", StatusCode.BAD_REQUEST);
            const notifications = await NotificationModel.find({ userId }).sort({ updatedAt: -1 });
            return notifications as unknown as Notification[]
        } catch (error) {
            throw new ErrorResponse((error as Error).message, StatusCode.INTERNAL_SERVER_ERROR);
        }
    }

    async updateNotifications(data: any): Promise<Notification[] | null> {
        try {
            if (!data) throw new ErrorResponse("data for notification update is not getting While try to Update Notifications.. !!", StatusCode.BAD_REQUEST);
            const { userId, roomId, companyId, lastMessage, unreadCount, user, company, updatedAt, companyname } = data
            let notification = await NotificationModel.findOne({ userId, roomId });

            if (notification) {
                // Update existing notification
                notification.userLastMessage = lastMessage;
                notification.unreadUserCount = unreadCount;
                notification.updatedAt = updatedAt;
            } else {
                // Create a new notification
                notification = new NotificationModel({
                    userId,
                    companyname,
                    roomId,
                    companyId,
                    lastMessage,
                    unreadCount,
                    updatedAt,
                    user,
                    company,
                });
            }

            await notification.save();
            const notifications = await NotificationModel.find({ userId }).sort({ updatedAt: -1 });

            return notifications as unknown as Notification[]

        } catch (error) {
            throw new ErrorResponse((error as Error).message, StatusCode.INTERNAL_SERVER_ERROR);
        }
    }

    async deleteNotifications(roomId: string, userId: string): Promise<object> {
        try {
            const notificationExist = await NotificationModel.findOne({ roomId, userId })

            if (!notificationExist) {
                return { success: true, message: "No notification found." };
            }

            await NotificationModel.updateOne(
                { roomId, userId },
                {
                    $set: {
                        unreadUserCount: 0,
                        userLastMessage: null
                    }
                }
            );

            return { success: true, message: "Notification deleted successfully." };

        } catch (error) {
            throw new ErrorResponse((error as Error).message, StatusCode.INTERNAL_SERVER_ERROR);
        }
    }


    async messageDeleteEveryOne(messageId: string): Promise<Message> {
        try {
            const findMessage = await MessageModel.findByIdAndUpdate(
                messageId,
                { deletedForSender: true },
                { new: true } // Returns the updated document
            ) as unknown as Message;

            if (!findMessage) {
                throw new Error("Message not found");
            }

            const chatRoom = await ChatRoom.findById(findMessage.roomId);


            if (chatRoom) {
                const remainingMessages = await MessageModel.find({ roomId: chatRoom._id });
                const validMessages = remainingMessages.filter(msg => !msg.deletedForSender && !msg.deletedForReceiver);

                if (validMessages.length > 0) {
                    const lastMessage = validMessages[validMessages.length - 1];
                    chatRoom.lastMessage = lastMessage.content
                } else {
                    chatRoom.lastMessage = '';
                }

                await chatRoom.save();
            }
            return findMessage
        } catch (error: unknown) {
            throw new ErrorResponse((error as Error).message, StatusCode.INTERNAL_SERVER_ERROR);
        }
    }

    async messageDeleteForMe(messageId: string): Promise<Message> {
        try {
            const findMessage = await MessageModel.findByIdAndUpdate(
                messageId,
                { deletedForReceiver: true },
                { new: true } // Returns the updated document
            ) as unknown as Message

            if (!findMessage) {
                throw new Error("Message not found");
            }

            const chatRoom = await ChatRoom.findById(findMessage.roomId);


            if (chatRoom) {
                const remainingMessages = await MessageModel.find({ roomId: chatRoom._id });
                const validMessages = remainingMessages.filter(msg => !msg.deletedForSender);

                if (validMessages.length > 0) {
                    const lastMessage = validMessages[validMessages.length - 1];
                    chatRoom.lastMessage = lastMessage.content
                } else {
                    chatRoom.lastMessage = '';  // No valid messages left
                }

                await chatRoom.save();
            }
            return findMessage
        } catch (error: unknown) {
            throw new ErrorResponse((error as Error).message, StatusCode.INTERNAL_SERVER_ERROR);
        }
    }

}