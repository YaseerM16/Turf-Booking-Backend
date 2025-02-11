import { AnyMxRecord } from "dns";
import { Company } from "../../../domain/entities/Company";
import { Slot } from "../../../domain/entities/Slot";
import { Turf } from "../../../domain/entities/Turf";
import { ICompanyRepository } from "../../../domain/repositories/ICompanyRepository";
import { DayRank, DayValue } from "../../../shared/utils/constants";
import { ErrorResponse } from "../../../shared/utils/errors";
import TurfService from "../../services/TurfService";
import CompanyModel from "../models/CompanyModel";
import { SlotModel } from "../models/SlotModel";
import TurfModel from "../models/TurfModel";
import { ChatRoom as ChatRoomEntity } from "../../../domain/entities/ChatRoom";
import { StatusCode } from "../../../shared/enums/StatusCode";
import ChatRoom from "../models/ChatRoomModel";
import { Message } from "../../../domain/entities/Message";
import MessageModel from "../models/MessageModel";
import NotificationModel from "../models/NotificationModel";
import BookingModel from "../models/BookingModel";
import mongoose from "mongoose";


export class CompanyRepository implements ICompanyRepository {

    async findByEmail(email: string): Promise<Company | null> {
        try {
            const companyDoc = await CompanyModel.findOne({ companyemail: email })
            return companyDoc ? companyDoc : null
        } catch (error: any) {
            throw new ErrorResponse(error.message, error.status);
        }
    }

    async create(company: Company): Promise<Company> {
        try {
            const companyDoc = new CompanyModel(company)
            await companyDoc.save()
            return companyDoc

        } catch (error: any) {
            throw new ErrorResponse(error.message, error.status);
        }
    }

    async update(id: string, value: any): Promise<Company | null> {
        try {
            const updatedCompany = await CompanyModel.findByIdAndUpdate(id, value, {
                new: true,
                fields: "-password"
            });
            return updatedCompany
        } catch (error: any) {
            throw new ErrorResponse(error.message, error.status);
        }
    }


    /// <-  Turf Repo  -> ///

    async registerTurf(turf: Turf, workingDays: string[]): Promise<Turf | null> {
        try {
            const savedTurf = await TurfService.registerTurf(turf, workingDays)
            await TurfService.markExpiredSlots()
            return savedTurf as unknown as Turf
        } catch (error: any) {
            throw new ErrorResponse(error.message, error.status);
        }
    }

    async getTurfs(companyId: string): Promise<Turf[] | null> {
        try {
            if (!companyId) throw new ErrorResponse("CompanyId is not Provided :", 500);

            const turfs = await TurfModel.find({ companyId }).sort({ createdAt: -1 }); // Sort by the most recent (descending)


            return turfs as unknown as Turf[]
        } catch (error: any) {
            throw new ErrorResponse(error.message, error.status);
        }
    }

    async blockTurf(turfId: string): Promise<object> {
        try {
            if (!turfId) throw new ErrorResponse("turfId is not Provided", 400);

            const updatedTurf = await TurfModel.findByIdAndUpdate(
                turfId,
                { isBlocked: true },
                { new: true }
            );

            if (!updatedTurf) {
                throw new ErrorResponse("Turf not found", 404);
            }

            return {
                success: true,
                message: "Turf successfully blocked",
                data: updatedTurf,
            };
        } catch (error: any) {
            throw new ErrorResponse(error.message, error.status);
        }
    }

    async unBlockTurf(turfId: string): Promise<object> {
        try {
            if (!turfId) throw new ErrorResponse("turfId is not Provided", 400);

            const updatedTurf = await TurfModel.findByIdAndUpdate(
                turfId,
                { isBlocked: false },
                { new: true }
            );

            if (!updatedTurf) {
                throw new ErrorResponse("Turf not found", 404);
            }

            return {
                success: true,
                message: "Turf successfully Un-blocked",
                data: updatedTurf,
            };
        } catch (error: any) {
            throw new ErrorResponse(error.message, error.status);
        }
    }

    async getTurfById(turfId: string): Promise<Turf | null> {
        try {
            if (!turfId) throw new ErrorResponse("TurfId is not Provided in Repository :", 500);

            const turf = await TurfModel.findById(turfId);
            if (!turf) throw new ErrorResponse("Turf not found", 404);

            return turf as unknown as Turf

        } catch (error: any) {
            throw new ErrorResponse(error.message, error.status);
        }
    }

    async deleteTurfImage(turfId: string, index: number): Promise<String[] | null> {
        try {
            if (!turfId || index === undefined || index === null) throw new ErrorResponse("TurfId or Index not Provided in Repository :", 500);

            const turf = await TurfModel.findById(turfId);

            if (!turf) {
                throw new Error("Turf not found");
            }

            if (index < 0 || index >= turf.images.length) {
                throw new Error("Invalid index");
            }

            turf.images.splice(index, 1);

            await turf.save();

            return turf.images;

        } catch (error: any) {
            throw new ErrorResponse(error.message, error.status);
        }
    }

    async editTurfById(turfId: string, turf: Turf): Promise<Turf | null> {
        try {
            if (!turfId) throw new ErrorResponse("TurfId or Index not Provided in Repository :", 400);
            const turfExist = await TurfModel.findById(turfId);
            if (!turfExist) {
                throw new ErrorResponse("Turf not found", 404);
            }

            const updatedImages = [
                ...(turfExist.images || []), // Retain existing images
                ...(turf.images || []), // Append new images
            ];

            const { images, ...restTurfDetails } = turf;


            const updatedTurf = await TurfModel.findByIdAndUpdate(
                turfId,
                {
                    $set: { ...restTurfDetails },
                    images: updatedImages,
                },
                { new: true }
            );

            return updatedTurf as unknown as Turf;

        } catch (error) {

        }
        throw new Error("Method not implemented.");
    }


    ///   <-   Slot   ->  ///
    async getSlotByDay(turfId: string, day: string, date: string): Promise<Slot[] | null> {
        try {
            const slots = await SlotModel.find({ turfId, day, date, isExpired: false }).populate('userId').exec();
            return slots as unknown as Slot[]
        } catch (error: any) {
            throw new ErrorResponse(error.message, error.status);
        }
    }

    async makeSlotUnavail(slotId: string, turfId: string): Promise<object> {
        try {
            if (!turfId || !slotId) throw new ErrorResponse("TurfId or SlotId not Provided in Repository :", 400);
            const updatedSlot = await SlotModel.findOneAndUpdate(
                { _id: slotId, turfId },
                { isUnavail: true },
                { new: true }
            );

            if (!updatedSlot) {
                throw new ErrorResponse("Slot not found", 404);
            }

            return { success: true, updatedSlot } as object
        } catch (error: any) {
            throw new ErrorResponse(error.message, error.status);
        }
    }

    async makeSlotAvail(slotId: string, turfId: string): Promise<object> {
        try {
            if (!turfId || !slotId) throw new ErrorResponse("TurfId or SlotId not Provided in Repository :", 400);
            const updatedSlot = await SlotModel.findOneAndUpdate(
                { _id: slotId, turfId },  // Find slot by slotId and turfId
                { isUnavail: false },       // Update the slot to make it unavailable
                { new: true }              // Return the updated slot after modification
            );

            // If no slot was found, return an error
            if (!updatedSlot) {
                throw new ErrorResponse("Slot not found", 404);
            }

            return { success: true, updatedSlot } as object
        } catch (error: any) {
            throw new ErrorResponse(error.message, error.status);
        }
    }

    async addWorkingDays(turfId: string, payload: any): Promise<object> {
        try {
            const { workingDays, fromTime, toTime, price } = payload;

            if (!workingDays || !fromTime || !toTime || !turfId || !price) {
                throw new ErrorResponse("Payload data for adding days is missing  :", 500);
            }

            const turf = await TurfModel.findById(turfId)
            if (!turf) return {}

            const existingWorkingDays = turf.workingSlots.workingDays.map((dayDetails) => dayDetails.day);

            const existingToDate = turf.generatedSlots?.toDate;

            const maxExistingRank = Math.max(
                ...existingWorkingDays.map((day) => DayRank[day as keyof typeof DayRank])
            );

            const maxIncomingRank = Math.max(
                ...workingDays.map((day: unknown) => DayRank[day as keyof typeof DayRank])
            );

            let updatedToDate;

            // Update `toDate` if the incoming days have a greater rank
            if (maxIncomingRank > maxExistingRank) {
                const maxDay = DayValue[maxIncomingRank as keyof typeof DayValue];
                const fromDate = new Date();
                const nextMonth = fromDate.getMonth() + 1; // Get next month
                const year = nextMonth > 11 ? fromDate.getFullYear() + 1 : fromDate.getFullYear();
                const month = nextMonth % 12;

                // Determine the last day of the next month
                const lastDayOfNextMonth = new Date(year, month + 1, 0); // `0` gives the last day of the previous month

                // Find the date of the `maxDay` in the last week of the next month
                const lastWeekStart = new Date(lastDayOfNextMonth);
                lastWeekStart.setDate(lastDayOfNextMonth.getDate() - 6); // Start of the last week

                let toDate = new Date(lastDayOfNextMonth); // Default to the last day
                for (let i = 0; i < 7; i++) {
                    const currentDay = (lastWeekStart.getDay() + i) % 7; // Get days in the last week
                    if (DayValue[currentDay as keyof typeof DayValue] === maxDay) {
                        toDate = new Date(lastWeekStart);
                        toDate.setDate(lastWeekStart.getDate() + i); // Set to matching `maxDay`
                        break;
                    }
                }

                const newToDate = new Date(toDate);
                newToDate.setDate(toDate.getDate() + 1); // Add 1 day

                updatedToDate = newToDate

            }


            const slots = TurfService.generateSlotsForUpdate(turfId, fromTime, toTime, workingDays, updatedToDate);

            // Save the new slots to the Slot collection and store the result
            const insertedSlots = await SlotModel.insertMany(slots);

            // Double-check if all intended slots were successfully inserted
            if (insertedSlots.length !== slots.length) {
                throw new ErrorResponse(
                    `Mismatch in inserted slots. Expected: ${slots.length}, Actual: ${insertedSlots.length}`,
                    500
                );
            }

            const newWorkingDays = workingDays.map((day: string) => ({
                day,
                fromTime,
                toTime,
                price
            }));

            const updateQuery: any = {
                $addToSet: {
                    "workingSlots.workingDays": { $each: newWorkingDays },
                },
            };

            if (updatedToDate) {
                updateQuery.$set = {
                    "generatedSlots.toDate": updatedToDate,
                };
            }

            const updatedTurf = await TurfModel.findByIdAndUpdate(
                turfId,
                updateQuery,
                { new: true } // Return the updated document
            );

            if (!updatedTurf) {
                throw new ErrorResponse(`Failed to update working days for turfId: ${turfId}`, 500);
            }

            // Return a success message with the count of inserted slots
            return {
                success: true,
                message: `${insertedSlots.length} slots added successfully and working days updated for turfId: ${turfId}`,
                insertedSlotIds: insertedSlots.map(slot => slot._id),
                updatedTurf,
            };
            // return {}

        } catch (error: any) {
            throw new ErrorResponse(error.message, error.status);
        }
    }

    async getDayDetails(turfId: string, day: string): Promise<object> {
        try {
            const turf = await TurfModel.findById(turfId);
            if (!turf) {
                throw new Error(`Turf with ID ${turfId} not found`);
            }

            const { workingSlots } = turf;

            // Check if the specified day exists in the workingSlots
            const dayDetails = workingSlots.workingDays.find((slot: any) => slot.day.toLowerCase() === day.toLowerCase());
            if (!dayDetails) {
                throw new Error(`Details for ${day} not found`);
            }

            return {
                dayDets: {
                    day: dayDetails.day,
                    fromTime: dayDetails.fromTime,
                    toTime: dayDetails.toTime,
                    price: dayDetails.price,
                }
            };

        } catch (error: any) {
            throw new ErrorResponse(error.message, error.status);
        }
    }

    async editDayDetails(turfId: string, updates: { fromTime: string; toTime: string; price: number; day: string }): Promise<object> {
        try {
            // Fetch the turf by ID
            const turf = await TurfModel.findById(turfId);
            if (!turf) {
                throw new Error(`Turf with ID ${turfId} not found`);
            }

            // Extract the `day` from updates to locate the specific working day
            const { day, fromTime, toTime, price } = updates;

            // Find the index of the working day to update
            const dayIndex = turf.workingSlots.workingDays.findIndex((workingDay: any) => workingDay.day === day);
            if (dayIndex === -1) {
                throw new Error(`Working day '${day}' not found in the turf's working slots`);
            }

            // Update the specific working day with new details
            turf.workingSlots.workingDays[dayIndex] = {
                ...turf.workingSlots.workingDays[dayIndex], // Retain other fields (e.g., `_id`)
                day,
                fromTime,
                toTime,
                price,
            };

            // Save the updated turf
            await turf.save();

            return {
                message: `Working day '${day}' updated successfully`,
                updatedDay: turf.workingSlots.workingDays[dayIndex],
            };
        } catch (error: any) {
            throw new ErrorResponse(error.message, error.status || 500);
        }
    }

    async createChatRoom(companyId: string, userId: string): Promise<ChatRoomEntity> {
        try {
            if (!companyId || !userId) {
                throw new ErrorResponse("UserID or CompanyID is not provided.", StatusCode.BAD_REQUEST);
            }
            const existingRoom = await ChatRoom.findOne({ userId, companyId });
            if (existingRoom) {
                return existingRoom as unknown as ChatRoomEntity
            }
            const newRoom = new ChatRoom({ userId, companyId });
            const savedRoom = await newRoom.save();
            return savedRoom as unknown as ChatRoomEntity
        } catch (error: any) {
            throw new ErrorResponse(error.message, error.status || StatusCode.INTERNAL_SERVER_ERROR);
        }
    }

    async getChatRooms(companyId: string): Promise<ChatRoomEntity[] | null> {
        try {
            if (!companyId) {
                throw new ErrorResponse("CompanyID is not provided.", StatusCode.BAD_REQUEST);
            }

            const chatRooms = await ChatRoom.find({ companyId })
                .populate({
                    path: 'userId',
                    select: 'name email phone profilePicture', // Specify the fields to include (or exclude)
                })

            return chatRooms as unknown as ChatRoomEntity[]

        } catch (error: any) {
            throw new ErrorResponse(error.message, error.status || StatusCode.INTERNAL_SERVER_ERROR);
        }
    }

    async getChatMessages(roomId: string): Promise<{ messages: Message[], chat: ChatRoomEntity } | null> {
        try {
            if (!roomId) {
                throw new ErrorResponse("RoomId is not provided While Trying to Get a Messages ..!", StatusCode.BAD_REQUEST);
            }

            await ChatRoom.updateOne({ _id: roomId }, { $set: { isReadCc: 0 } })
            await MessageModel.updateMany({ roomId }, { $set: { isRead: true } })
            const messages = await MessageModel.find({ roomId })
            const updatedChatRoom = await ChatRoom.findById(roomId).populate({
                path: 'userId',
                select: 'name email phone profilePicture', // Specify the fields to include (or exclude)
            })
                .exec();
            return { messages: messages as unknown as Message[], chat: updatedChatRoom as unknown as ChatRoomEntity }
        } catch (error: any) {
            throw new ErrorResponse(error.message, error.status || StatusCode.INTERNAL_SERVER_ERROR);
        }
    }

    async onSendMessage(companyId: string, userId: string, data: { roomId: string, message: string }): Promise<Message> {
        try {
            if (!companyId || !userId || !data) {
                throw new ErrorResponse("UserID or CompanyID or data is not provided.", StatusCode.BAD_REQUEST);
            }
            const { roomId, message } = data

            const newMessage = new MessageModel({ senderId: companyId, receiverId: userId, roomId, content: message })
            await newMessage.save()

            await ChatRoom.findByIdAndUpdate(roomId, { lastMessage: message, createdAt: new Date().toISOString() }, { new: true })

            return newMessage as unknown as Message
        } catch (error: any) {
            throw new ErrorResponse(error.message, error.status || StatusCode.INTERNAL_SERVER_ERROR);
        }
    }

    async getNotifications(companyId: string): Promise<Notification[] | null> {
        try {
            if (!companyId) throw new ErrorResponse("UserId is not provided While Trying to Get the Notifications ..!", StatusCode.BAD_REQUEST);
            const notifications = await NotificationModel.find({ companyId }).sort({ updatedAt: -1 });
            return notifications as unknown as Notification[]
        } catch (error) {
            throw new ErrorResponse((error as Error).message, StatusCode.INTERNAL_SERVER_ERROR);
        }
    }

    async updateNotifications(data: any): Promise<Notification[] | null> {
        try {
            if (!data) throw new ErrorResponse("data for notification update is not getting While try to Update Notifications.. !!", StatusCode.BAD_REQUEST);
            const { userId, roomId, companyId, lastMessage, unreadCount, user, company, updatedAt, companyname } = data
            let notification = await NotificationModel.findOne({ companyId, roomId });

            if (notification) {
                // Update existing notification
                notification.companyLastMessage = lastMessage;
                notification.unreadCompanyCount = unreadCount;
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
            const notifications = await NotificationModel.find({ companyId }).sort({ updatedAt: -1 });

            return notifications as unknown as Notification[]

        } catch (error) {
            throw new ErrorResponse((error as Error).message, StatusCode.INTERNAL_SERVER_ERROR);
        }
    }

    async deleteNotifications(roomId: string, companyId: string): Promise<object> {
        try {
            const notificationExist = await NotificationModel.findOne({ roomId, companyId })

            if (!notificationExist) {
                return { success: true, message: "No notification found." };
            }

            await NotificationModel.updateOne(
                { roomId, companyId },
                {
                    $set: {
                        unreadCompanyCount: 0,
                        companyLastMessage: null
                    }
                }
            );

            return { success: true, message: "Notification deleted successfully." };

        } catch (error) {
            throw new ErrorResponse((error as Error).message, StatusCode.INTERNAL_SERVER_ERROR);
        }
    }

    async getDashboardData(companyId: string): Promise<any> {
        try {
            if (!companyId) {
                throw new ErrorResponse("Company ID is required to fetch dashboard data!", StatusCode.BAD_REQUEST);
            }

            // Aggregate pipeline
            const currentDate = new Date();
            const last7DaysStart = new Date();
            last7DaysStart.setDate(currentDate.getDate() - 7); // 7 days ago (excluding today)
            const last7DaysEnd = new Date();
            last7DaysEnd.setDate(currentDate.getDate() - 1); // Until yesterday

            const dashboardData = await BookingModel.aggregate([
                {
                    $match: {
                        companyId: new mongoose.Types.ObjectId(companyId),
                        totalAmount: { $gt: 0 }
                    }
                },
                { $unwind: "$selectedSlots" }, // Work with individual slots
                {
                    $group: {
                        _id: null,
                        totalBookings: { $sum: 1 }, // Total number of bookings (counting slots)
                        completedBookings: {
                            $sum: {
                                $cond: [{ $lt: ["$selectedSlots.date", currentDate] }, 1, 0]
                            }
                        },
                        upcomingBookings: {
                            $sum: {
                                $cond: [{ $gte: ["$selectedSlots.date", currentDate] }, 1, 0]
                            }
                        },
                        totalRevenue: {
                            $sum: {
                                $cond: [{ $eq: ["$status", "completed"] }, "$totalAmount", 0]
                            }
                        },
                        last7DaysRevenue: {
                            $push: {
                                $cond: [
                                    {
                                        $and: [
                                            { $gte: ["$selectedSlots.date", last7DaysStart] },
                                            { $lt: ["$selectedSlots.date", last7DaysEnd] },
                                            { $eq: ["$selectedSlots.isCancelled", false] }
                                        ]
                                    },
                                    {
                                        date: { $dateToString: { format: "%Y-%m-%d", date: "$selectedSlots.date" } },
                                        revenue: "$selectedSlots.price"
                                    },
                                    "$$REMOVE" // Removes non-matching entries
                                ]
                            }
                        }
                    }
                },
                {
                    $project: {
                        _id: 0,
                        totalBookings: 1,
                        completedBookings: 1,
                        upcomingBookings: 1,
                        totalRevenue: 1,
                        pendingPayments: 1,
                        last7DaysRevenue: {
                            $reduce: {
                                input: "$last7DaysRevenue",
                                initialValue: [],
                                in: {
                                    $concatArrays: [
                                        "$$value",
                                        [{ date: "$$this.date", revenue: "$$this.revenue" }]
                                    ]
                                }
                            }
                        }
                    }
                }
            ]);

            return dashboardData.length > 0
                ? dashboardData[0]
                : {
                    totalBookings: 0,
                    upcomingBookings: 0,
                    completedBookings: 0,
                    totalRevenue: 0,
                };

        } catch (error) {
            throw new ErrorResponse((error as Error).message, StatusCode.INTERNAL_SERVER_ERROR);
        }
    }

    async getMonthlyRevenue(companyId: string): Promise<any> {
        try {
            if (!companyId) {
                throw new ErrorResponse("Company ID is required to fetch monthly revenue!", StatusCode.BAD_REQUEST);
            }

            const monthlyRevenue = await BookingModel.aggregate([
                {
                    $match: {
                        companyId: new mongoose.Types.ObjectId(companyId),
                        totalAmount: { $gt: 0 } // Ensure the booking has a valid amount
                    }
                },
                { $unwind: "$selectedSlots" }, // Unwind to work with individual slots
                {
                    $match: {
                        "selectedSlots.isCancelled": false // Ensure the slot is not canceled
                    }
                },
                {
                    $group: {
                        _id: { $dateToString: { format: "%Y-%m", date: "$selectedSlots.date" } }, // Group by Year-Month
                        revenue: { $sum: "$selectedSlots.price" } // Sum price of slots for each month
                    }
                },
                {
                    $project: {
                        _id: 0,
                        month: "$_id", // Rename _id to month
                        revenue: 1
                    }
                },
                { $sort: { month: 1 } } // Sort by month in ascending order
            ]);

            return monthlyRevenue;

        } catch (error) {
            throw new ErrorResponse((error as Error).message, StatusCode.INTERNAL_SERVER_ERROR);
        }
    }

    async getRevenueByRange(companyId: string, fromDate: Date, toDate: Date): Promise<any> {
        try {
            if (!companyId || !fromDate || !toDate) {
                throw new ErrorResponse("Company ID, From Date, and To Date are required!", StatusCode.BAD_REQUEST);
            }

            const from = new Date(fromDate);
            const to = new Date(toDate);

            if (isNaN(from.getTime()) || isNaN(to.getTime())) {
                throw new ErrorResponse("Invalid date format!", StatusCode.BAD_REQUEST);
            }

            const revenueByRange = await BookingModel.aggregate([
                {
                    $match: {
                        companyId: new mongoose.Types.ObjectId(companyId),
                        totalAmount: { $gt: 0 }
                    }
                },
                { $unwind: "$selectedSlots" }, // Work with individual slots
                {
                    $match: {
                        "selectedSlots.date": { $gte: from, $lte: to }, // Filter by date range
                        "selectedSlots.isCancelled": false // Ensure slot is not canceled
                    }
                },
                {
                    $group: {
                        _id: { $dateToString: { format: "%Y-%m-%d", date: "$selectedSlots.date" } }, // Group by date
                        revenue: { $sum: "$selectedSlots.price" } // Sum price of slots for each date
                    }
                },
                {
                    $project: {
                        _id: 0,
                        date: "$_id", // Rename _id to date
                        revenue: 1
                    }
                },
                { $sort: { date: 1 } } // Sort by date in ascending order
            ]);

            return revenueByRange;

        } catch (error) {
            throw new ErrorResponse((error as Error).message, StatusCode.INTERNAL_SERVER_ERROR);
        }
    }

    async getOverallRevenueByTurf(companyId: string, turfId: string): Promise<any> {
        try {
            if (!companyId || !turfId) {
                throw new ErrorResponse("Company ID and Turf ID are required to fetch turf revenue data!", StatusCode.BAD_REQUEST);
            }
            const currentDate = new Date();
            const last7DaysStart = new Date();
            last7DaysStart.setDate(currentDate.getDate() - 7); // 7 days ago (excluding today)
            const last7DaysEnd = new Date();
            last7DaysEnd.setDate(currentDate.getDate() - 1); // Until yesterday
            const dashboardData = await BookingModel.aggregate([
                {
                    $match: {
                        companyId: new mongoose.Types.ObjectId(companyId),
                        turfId: new mongoose.Types.ObjectId(turfId),
                        totalAmount: { $gt: 0 },
                    }
                },
                { $unwind: "$selectedSlots" },
                {
                    $group: {
                        _id: null,
                        totalBookings: { $sum: 1 },
                        completedBookings: {
                            $sum: {
                                $cond: [{ $lt: ["$selectedSlots.date", new Date()] }, 1, 0]
                            }
                        },
                        upcomingBookings: {
                            $sum: {
                                $cond: [{ $gte: ["$selectedSlots.date", new Date()] }, 1, 0]
                            }
                        },
                        totalRevenue: {
                            $sum: {
                                $cond: [{ $eq: ["$status", "completed"] }, "$totalAmount", 0]
                            }
                        },
                        last7DaysRevenue: {
                            $push: {
                                $cond: [
                                    {
                                        $and: [
                                            { $gte: ["$selectedSlots.date", last7DaysStart] },
                                            { $lt: ["$selectedSlots.date", last7DaysEnd] },
                                            { $eq: ["$selectedSlots.isCancelled", false] }
                                        ]
                                    },
                                    {
                                        date: { $dateToString: { format: "%Y-%m-%d", date: "$selectedSlots.date" } },
                                        revenue: "$selectedSlots.price"
                                    },
                                    "$$REMOVE" // Removes non-matching entries
                                ]
                            }
                        }
                    }
                },
                {
                    $project: {
                        _id: 0,
                        totalBookings: 1,
                        completedBookings: 1,
                        upcomingBookings: 1,
                        totalRevenue: 1,
                        last7DaysRevenue: 1,
                    }
                }
            ]);

            return dashboardData.length > 0 ? dashboardData[0] : {
                totalBookings: 0,
                completedBookings: 0,
                upcomingBookings: 0,
                totalRevenue: 0
            };
        } catch (error) {
            throw new ErrorResponse((error as Error).message, StatusCode.INTERNAL_SERVER_ERROR);
        }
    }


}

