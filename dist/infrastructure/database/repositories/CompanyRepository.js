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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CompanyRepository = void 0;
const constants_1 = require("../../../shared/utils/constants");
const errors_1 = require("../../../shared/utils/errors");
const TurfService_1 = __importDefault(require("../../services/TurfService"));
const CompanyModel_1 = __importDefault(require("../models/CompanyModel"));
const SlotModel_1 = require("../models/SlotModel");
const TurfModel_1 = __importDefault(require("../models/TurfModel"));
const StatusCode_1 = require("../../../shared/enums/StatusCode");
const ChatRoomModel_1 = __importDefault(require("../models/ChatRoomModel"));
const MessageModel_1 = __importDefault(require("../models/MessageModel"));
const BookingModel_1 = __importDefault(require("../models/BookingModel"));
const mongoose_1 = __importDefault(require("mongoose"));
class CompanyRepository {
    findByEmail(email) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const companyDoc = yield CompanyModel_1.default.findOne({ companyemail: email });
                if (companyDoc)
                    return companyDoc;
                return null;
            }
            catch (error) {
                throw new errors_1.ErrorResponse(error.message, error.status);
            }
        });
    }
    create(company) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const companyDoc = new CompanyModel_1.default(company);
                yield companyDoc.save();
                return companyDoc;
            }
            catch (error) {
                throw new errors_1.ErrorResponse(error.message, error.status);
            }
        });
    }
    update(id, value) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const updatedCompany = yield CompanyModel_1.default.findByIdAndUpdate(id, value, {
                    new: true,
                    fields: "-password"
                });
                return updatedCompany;
            }
            catch (error) {
                throw new errors_1.ErrorResponse(error.message, error.status);
            }
        });
    }
    /// <-  Turf Repo  -> ///
    registerTurf(turf, workingDays) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const existingTurf = yield TurfModel_1.default.findOne({ turfName: turf.turfName });
                if (existingTurf) {
                    throw new Error("Turf name already exists");
                }
                const savedTurf = yield TurfService_1.default.registerTurf(turf, workingDays);
                yield TurfService_1.default.markExpiredSlots();
                return savedTurf;
            }
            catch (error) {
                throw new errors_1.ErrorResponse(error.message, error.status);
            }
        });
    }
    getTurfs(companyId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!companyId)
                    throw new errors_1.ErrorResponse("CompanyId is not Provided :", 500);
                const turfs = yield TurfModel_1.default.find({ companyId }).sort({ createdAt: -1 }); // Sort by the most recent (descending)
                return turfs;
            }
            catch (error) {
                throw new errors_1.ErrorResponse(error.message, error.status);
            }
        });
    }
    blockTurf(turfId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!turfId)
                    throw new errors_1.ErrorResponse("turfId is not Provided", 400);
                const updatedTurf = yield TurfModel_1.default.findByIdAndUpdate(turfId, { isBlocked: true }, { new: true });
                if (!updatedTurf) {
                    throw new errors_1.ErrorResponse("Turf not found", 404);
                }
                return {
                    success: true,
                    message: "Turf successfully blocked",
                    data: updatedTurf,
                };
            }
            catch (error) {
                throw new errors_1.ErrorResponse(error.message, error.status);
            }
        });
    }
    unBlockTurf(turfId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!turfId)
                    throw new errors_1.ErrorResponse("turfId is not Provided", 400);
                const updatedTurf = yield TurfModel_1.default.findByIdAndUpdate(turfId, { isBlocked: false }, { new: true });
                if (!updatedTurf) {
                    throw new errors_1.ErrorResponse("Turf not found", 404);
                }
                return {
                    success: true,
                    message: "Turf successfully Un-blocked",
                    data: updatedTurf,
                };
            }
            catch (error) {
                throw new errors_1.ErrorResponse(error.message, error.status);
            }
        });
    }
    getTurfById(companyId, turfId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!turfId || !companyId)
                    throw new errors_1.ErrorResponse("TurfId or CompanyId were not provided in Repository", 400);
                const turf = yield TurfModel_1.default.findOne({ _id: turfId, companyId }); // Ensure turf belongs to the company
                if (!turf)
                    throw new errors_1.ErrorResponse("Turf not found or Unauthorized", 404);
                return turf;
            }
            catch (error) {
                throw new errors_1.ErrorResponse(error.message, error.status || 500);
            }
        });
    }
    deleteTurfImage(turfId, index) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!turfId || index === undefined || index === null)
                    throw new errors_1.ErrorResponse("TurfId or Index not Provided in Repository :", 500);
                const turf = yield TurfModel_1.default.findById(turfId);
                if (!turf) {
                    throw new Error("Turf not found");
                }
                if (index < 0 || index >= turf.images.length) {
                    throw new Error("Invalid index");
                }
                turf.images.splice(index, 1);
                yield turf.save();
                return turf.images;
            }
            catch (error) {
                throw new errors_1.ErrorResponse(error.message, error.status);
            }
        });
    }
    editTurfById(turfId, turf) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!turfId)
                    throw new errors_1.ErrorResponse("TurfId or Index not Provided in Repository :", 400);
                const turfExist = yield TurfModel_1.default.findById(turfId);
                if (!turfExist) {
                    throw new errors_1.ErrorResponse("Turf not found", 404);
                }
                const updatedImages = [
                    ...(turfExist.images || []), // Retain existing images
                    ...(turf.images || []), // Append new images
                ];
                const { images } = turf, restTurfDetails = __rest(turf, ["images"]);
                const updatedTurf = yield TurfModel_1.default.findByIdAndUpdate(turfId, {
                    $set: Object.assign({}, restTurfDetails),
                    images: updatedImages,
                }, { new: true });
                return updatedTurf;
            }
            catch (error) {
            }
            throw new Error("Method not implemented.");
        });
    }
    ///   <-   Slot   ->  ///
    getSlotByDay(turfId, day, date) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const slots = yield SlotModel_1.SlotModel.find({ turfId, day, date, isExpired: false }).populate('userId').exec();
                return slots;
            }
            catch (error) {
                throw new errors_1.ErrorResponse(error.message, error.status);
            }
        });
    }
    makeSlotUnavail(slotId, turfId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!turfId || !slotId)
                    throw new errors_1.ErrorResponse("TurfId or SlotId not Provided in Repository :", 400);
                const updatedSlot = yield SlotModel_1.SlotModel.findOneAndUpdate({ _id: slotId, turfId }, { isUnavail: true }, { new: true });
                if (!updatedSlot) {
                    throw new errors_1.ErrorResponse("Slot not found", 404);
                }
                return { success: true, updatedSlot };
            }
            catch (error) {
                throw new errors_1.ErrorResponse(error.message, error.status);
            }
        });
    }
    makeSlotAvail(slotId, turfId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!turfId || !slotId)
                    throw new errors_1.ErrorResponse("TurfId or SlotId not Provided in Repository :", 400);
                const updatedSlot = yield SlotModel_1.SlotModel.findOneAndUpdate({ _id: slotId, turfId }, // Find slot by slotId and turfId
                { isUnavail: false }, // Update the slot to make it unavailable
                { new: true } // Return the updated slot after modification
                );
                // If no slot was found, return an error
                if (!updatedSlot) {
                    throw new errors_1.ErrorResponse("Slot not found", 404);
                }
                return { success: true, updatedSlot };
            }
            catch (error) {
                throw new errors_1.ErrorResponse(error.message, error.status);
            }
        });
    }
    addWorkingDays(turfId, payload) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const { workingDays, fromTime, toTime, price } = payload;
                if (!workingDays || !fromTime || !toTime || !turfId || !price) {
                    throw new errors_1.ErrorResponse("Payload data for adding days is missing  :", 500);
                }
                const turf = yield TurfModel_1.default.findById(turfId);
                if (!turf)
                    return {};
                const existingWorkingDays = turf.workingSlots.workingDays.map((dayDetails) => dayDetails.day);
                const existingToDate = (_a = turf.generatedSlots) === null || _a === void 0 ? void 0 : _a.toDate;
                const maxExistingRank = Math.max(...existingWorkingDays.map((day) => constants_1.DayRank[day]));
                const maxIncomingRank = Math.max(...workingDays.map((day) => constants_1.DayRank[day]));
                let updatedToDate;
                // Update `toDate` if the incoming days have a greater rank
                if (maxIncomingRank > maxExistingRank) {
                    const maxDay = constants_1.DayValue[maxIncomingRank];
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
                        if (constants_1.DayValue[currentDay] === maxDay) {
                            toDate = new Date(lastWeekStart);
                            toDate.setDate(lastWeekStart.getDate() + i); // Set to matching `maxDay`
                            break;
                        }
                    }
                    const newToDate = new Date(toDate);
                    newToDate.setDate(toDate.getDate() + 1); // Add 1 day
                    updatedToDate = newToDate;
                }
                const slots = TurfService_1.default.generateSlotsForUpdate(turfId, fromTime, toTime, workingDays, updatedToDate);
                // Save the new slots to the Slot collection and store the result
                const insertedSlots = yield SlotModel_1.SlotModel.insertMany(slots);
                // Double-check if all intended slots were successfully inserted
                if (insertedSlots.length !== slots.length) {
                    throw new errors_1.ErrorResponse(`Mismatch in inserted slots. Expected: ${slots.length}, Actual: ${insertedSlots.length}`, 500);
                }
                const newWorkingDays = workingDays.map((day) => ({
                    day,
                    fromTime,
                    toTime,
                    price
                }));
                const updateQuery = {
                    $addToSet: {
                        "workingSlots.workingDays": { $each: newWorkingDays },
                    },
                };
                if (updatedToDate) {
                    updateQuery.$set = {
                        "generatedSlots.toDate": updatedToDate,
                    };
                }
                const updatedTurf = yield TurfModel_1.default.findByIdAndUpdate(turfId, updateQuery, { new: true } // Return the updated document
                );
                if (!updatedTurf) {
                    throw new errors_1.ErrorResponse(`Failed to update working days for turfId: ${turfId}`, 500);
                }
                // Return a success message with the count of inserted slots
                return {
                    success: true,
                    message: `${insertedSlots.length} slots added successfully and working days updated for turfId: ${turfId}`,
                    insertedSlotIds: insertedSlots.map(slot => slot._id),
                    updatedTurf,
                };
                // return {}
            }
            catch (error) {
                throw new errors_1.ErrorResponse(error.message, error.status);
            }
        });
    }
    getDayDetails(turfId, day) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const turf = yield TurfModel_1.default.findById(turfId);
                if (!turf) {
                    throw new Error(`Turf with ID ${turfId} not found`);
                }
                const { workingSlots } = turf;
                // Check if the specified day exists in the workingSlots
                const dayDetails = workingSlots.workingDays.find((slot) => slot.day.toLowerCase() === day.toLowerCase());
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
            }
            catch (error) {
                throw new errors_1.ErrorResponse(error.message, error.status);
            }
        });
    }
    editDayDetails(turfId, updates) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Fetch the turf by ID
                const turf = yield TurfModel_1.default.findById(turfId);
                if (!turf) {
                    throw new Error(`Turf with ID ${turfId} not found`);
                }
                // Extract the `day` from updates to locate the specific working day
                const { day, fromTime, toTime, price } = updates;
                // Find the index of the working day to update
                const dayIndex = turf.workingSlots.workingDays.findIndex((workingDay) => workingDay.day === day);
                if (dayIndex === -1) {
                    throw new Error(`Working day '${day}' not found in the turf's working slots`);
                }
                // Update the specific working day with new details
                turf.workingSlots.workingDays[dayIndex] = Object.assign(Object.assign({}, turf.workingSlots.workingDays[dayIndex]), { // Retain other fields (e.g., `_id`)
                    day,
                    fromTime,
                    toTime,
                    price });
                // Save the updated turf
                yield turf.save();
                return {
                    message: `Working day '${day}' updated successfully`,
                    updatedDay: turf.workingSlots.workingDays[dayIndex],
                };
            }
            catch (error) {
                throw new errors_1.ErrorResponse(error.message, error.status || 500);
            }
        });
    }
    createChatRoom(companyId, userId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!companyId || !userId) {
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
                throw new errors_1.ErrorResponse(error.message, error.status || StatusCode_1.StatusCode.INTERNAL_SERVER_ERROR);
            }
        });
    }
    getChatRooms(companyId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!companyId) {
                    throw new errors_1.ErrorResponse("CompanyID is not provided.", StatusCode_1.StatusCode.BAD_REQUEST);
                }
                const chatRooms = yield ChatRoomModel_1.default.find({ companyId })
                    .populate({
                    path: 'userId',
                    select: 'name email phone profilePicture', // Specify the fields to include (or exclude)
                });
                return chatRooms;
            }
            catch (error) {
                throw new errors_1.ErrorResponse(error.message, error.status || StatusCode_1.StatusCode.INTERNAL_SERVER_ERROR);
            }
        });
    }
    getChatMessages(roomId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!roomId) {
                    throw new errors_1.ErrorResponse("RoomId is not provided While Trying to Get a Messages ..!", StatusCode_1.StatusCode.BAD_REQUEST);
                }
                yield ChatRoomModel_1.default.updateOne({ _id: roomId }, { $set: { isReadCc: 0 } });
                yield MessageModel_1.default.updateMany({ roomId }, { $set: { isRead: true } });
                const messages = yield MessageModel_1.default.find({ roomId });
                const updatedChatRoom = yield ChatRoomModel_1.default.findById(roomId).populate({
                    path: 'userId',
                    select: 'name email phone profilePicture', // Specify the fields to include (or exclude)
                })
                    .exec();
                return { messages: messages, chat: updatedChatRoom };
            }
            catch (error) {
                throw new errors_1.ErrorResponse(error.message, error.status || StatusCode_1.StatusCode.INTERNAL_SERVER_ERROR);
            }
        });
    }
    onSendMessage(companyId, userId, data) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!companyId || !userId || !data) {
                    throw new errors_1.ErrorResponse("UserID or CompanyID or data is not provided.", StatusCode_1.StatusCode.BAD_REQUEST);
                }
                const { roomId, message } = data;
                const newMessage = new MessageModel_1.default({ senderId: companyId, receiverId: userId, roomId, content: message });
                yield newMessage.save();
                yield ChatRoomModel_1.default.findByIdAndUpdate(roomId, { lastMessage: message, createdAt: new Date().toISOString() }, { new: true });
                return newMessage;
            }
            catch (error) {
                throw new errors_1.ErrorResponse(error.message, error.status || StatusCode_1.StatusCode.INTERNAL_SERVER_ERROR);
            }
        });
    }
    getDashboardData(companyId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!companyId) {
                    throw new errors_1.ErrorResponse("Company ID is required to fetch dashboard data!", StatusCode_1.StatusCode.BAD_REQUEST);
                }
                // Aggregate pipeline
                const currentDate = new Date();
                const last7DaysStart = new Date();
                last7DaysStart.setDate(currentDate.getDate() - 7); // 7 days ago (excluding today)
                const last7DaysEnd = new Date();
                last7DaysEnd.setDate(currentDate.getDate() - 1); // Until yesterday
                const dashboardData = yield BookingModel_1.default.aggregate([
                    {
                        $match: {
                            companyId: new mongoose_1.default.Types.ObjectId(companyId),
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
            }
            catch (error) {
                throw new errors_1.ErrorResponse(error.message, StatusCode_1.StatusCode.INTERNAL_SERVER_ERROR);
            }
        });
    }
    getMonthlyRevenue(companyId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!companyId) {
                    throw new errors_1.ErrorResponse("Company ID is required to fetch monthly revenue!", StatusCode_1.StatusCode.BAD_REQUEST);
                }
                const monthlyRevenue = yield BookingModel_1.default.aggregate([
                    {
                        $match: {
                            companyId: new mongoose_1.default.Types.ObjectId(companyId),
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
            }
            catch (error) {
                throw new errors_1.ErrorResponse(error.message, StatusCode_1.StatusCode.INTERNAL_SERVER_ERROR);
            }
        });
    }
    getRevenueByRange(companyId, fromDate, toDate) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!companyId || !fromDate || !toDate) {
                    throw new errors_1.ErrorResponse("Company ID, From Date, and To Date are required!", StatusCode_1.StatusCode.BAD_REQUEST);
                }
                const from = new Date(fromDate);
                const to = new Date(toDate);
                if (isNaN(from.getTime()) || isNaN(to.getTime())) {
                    throw new errors_1.ErrorResponse("Invalid date format!", StatusCode_1.StatusCode.BAD_REQUEST);
                }
                const revenueByRange = yield BookingModel_1.default.aggregate([
                    {
                        $match: {
                            companyId: new mongoose_1.default.Types.ObjectId(companyId),
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
            }
            catch (error) {
                throw new errors_1.ErrorResponse(error.message, StatusCode_1.StatusCode.INTERNAL_SERVER_ERROR);
            }
        });
    }
    getOverallRevenueByTurf(companyId, turfId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!companyId || !turfId) {
                    throw new errors_1.ErrorResponse("Company ID and Turf ID are required to fetch turf revenue data!", StatusCode_1.StatusCode.BAD_REQUEST);
                }
                const currentDate = new Date();
                const last7DaysStart = new Date();
                last7DaysStart.setDate(currentDate.getDate() - 7); // 7 days ago (excluding today)
                const last7DaysEnd = new Date();
                last7DaysEnd.setDate(currentDate.getDate() - 1); // Until yesterday
                const dashboardData = yield BookingModel_1.default.aggregate([
                    {
                        $match: {
                            companyId: new mongoose_1.default.Types.ObjectId(companyId),
                            turfId: new mongoose_1.default.Types.ObjectId(turfId),
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
            }
            catch (error) {
                throw new errors_1.ErrorResponse(error.message, StatusCode_1.StatusCode.INTERNAL_SERVER_ERROR);
            }
        });
    }
    // SalesReport
    getLastMonthRevenue(companyId, page, limit) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!companyId) {
                    throw new errors_1.ErrorResponse("Company ID is required to fetch revenue data!", StatusCode_1.StatusCode.BAD_REQUEST);
                }
                const skip = (page - 1) * limit;
                // Define the date range (last 30 days)
                const currentDate = new Date();
                const last30DaysStart = new Date();
                last30DaysStart.setDate(currentDate.getDate() - 30);
                // Step 1: Get total count before pagination
                const totalRevenues = yield BookingModel_1.default.aggregate([
                    {
                        $match: {
                            companyId: new mongoose_1.default.Types.ObjectId(companyId),
                            totalAmount: { $gt: 0 }
                        }
                    },
                    { $unwind: "$selectedSlots" },
                    {
                        $match: {
                            "selectedSlots.date": { $gte: last30DaysStart, $lt: currentDate },
                            "selectedSlots.isCancelled": false
                        }
                    },
                    {
                        $group: {
                            _id: {
                                date: { $dateToString: { format: "%Y-%m-%d", date: "$selectedSlots.date" } },
                                turfId: "$selectedSlots.turfId"
                            },
                            revenue: { $sum: "$selectedSlots.price" }
                        }
                    }
                ]);
                const totalTurfCountQry = yield BookingModel_1.default.aggregate([
                    {
                        $match: {
                            companyId: new mongoose_1.default.Types.ObjectId(companyId),
                            totalAmount: { $gt: 0 }
                        }
                    },
                    { $unwind: "$selectedSlots" }, // Step 2: Expand selectedSlots array
                    {
                        $match: {
                            "selectedSlots.date": { $gte: last30DaysStart, $lt: currentDate },
                            "selectedSlots.isCancelled": false
                        }
                    },
                    {
                        $group: {
                            _id: "$selectedSlots.turfId" // Step 4: Group by turfId
                        }
                    },
                    {
                        $group: {
                            _id: null,
                            totalTurfs: { $sum: 1 } // Step 5: Count unique turfs
                        }
                    }
                ]);
                // Step 2: Apply pagination using skip and limit
                const revenueData = yield BookingModel_1.default.aggregate([
                    {
                        $match: {
                            companyId: new mongoose_1.default.Types.ObjectId(companyId),
                            totalAmount: { $gt: 0 }
                        }
                    },
                    { $unwind: "$selectedSlots" },
                    {
                        $match: {
                            "selectedSlots.date": { $gte: last30DaysStart, $lt: currentDate },
                            "selectedSlots.isCancelled": false
                        }
                    },
                    {
                        $group: {
                            _id: {
                                date: { $dateToString: { format: "%Y-%m-%d", date: "$selectedSlots.date" } },
                                turfId: "$selectedSlots.turfId"
                            },
                            revenue: { $sum: "$selectedSlots.price" }
                        }
                    },
                    { $sort: { "_id.date": -1 } }, // Sort by date descending
                    { $skip: skip },
                    { $limit: Number(limit) }
                ]);
                // Extract unique turfIds
                const turfIds = [...new Set(revenueData.map(item => item._id.turfId))];
                // Fetch Turf details
                const turfs = yield TurfModel_1.default.find({ _id: { $in: turfIds } }).select("turfName location images");
                // Merge revenue data with Turf details
                const result = revenueData.map(revenue => {
                    const turf = turfs.find(turf => turf._id.toString() === revenue._id.turfId.toString());
                    return {
                        date: revenue._id.date,
                        revenue: revenue.revenue,
                        turfName: turf ? turf.turfName : "Unknown",
                        location: turf ? turf.location : "Unknown",
                        images: turf ? turf.images : []
                    };
                });
                // Compute total revenue and bookings
                const totalRevenue = totalRevenues.reduce((sum, entry) => sum + entry.revenue, 0);
                const totalTurfCount = totalTurfCountQry.length > 0 ? totalTurfCountQry[0] : { totalTurfs: 0 };
                // console.log(JSON.stringify(generateBookings(50), null, 2));
                return {
                    result,
                    totalTurfCount,
                    totalRevenue,
                    totalBookings: totalRevenues.length, // Total count before pagination
                    currentPage: page
                };
            }
            catch (error) {
                throw new errors_1.ErrorResponse(error.message, StatusCode_1.StatusCode.INTERNAL_SERVER_ERROR);
            }
        });
    }
    getRevenuesByInterval(companyId, fromDate, toDate, page, limit) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!companyId || !fromDate || !toDate) {
                    throw new errors_1.ErrorResponse("Company ID, From Date, and To Date are required!", StatusCode_1.StatusCode.BAD_REQUEST);
                }
                // Ensure valid date inputs
                const from = new Date(fromDate);
                const to = new Date(toDate);
                to.setHours(23, 59, 59, 999); // Include the full day of 'toDate'
                const skip = (page - 1) * limit;
                const totalRevenues = yield BookingModel_1.default.aggregate([
                    {
                        $match: {
                            companyId: new mongoose_1.default.Types.ObjectId(companyId),
                            totalAmount: { $gt: 0 }
                        }
                    },
                    { $unwind: "$selectedSlots" },
                    {
                        $match: {
                            "selectedSlots.date": { $gte: from, $lt: to },
                            "selectedSlots.isCancelled": false
                        }
                    },
                    {
                        $group: {
                            _id: {
                                date: { $dateToString: { format: "%Y-%m-%d", date: "$selectedSlots.date" } },
                                turfId: "$selectedSlots.turfId"
                            },
                            revenue: { $sum: "$selectedSlots.price" }
                        }
                    }
                ]);
                const totalTurfCountQry = yield BookingModel_1.default.aggregate([
                    {
                        $match: {
                            companyId: new mongoose_1.default.Types.ObjectId(companyId),
                            totalAmount: { $gt: 0 }
                        }
                    },
                    { $unwind: "$selectedSlots" }, // Step 2: Expand selectedSlots array
                    {
                        $match: {
                            "selectedSlots.date": { $gte: from, $lt: to },
                            "selectedSlots.isCancelled": false
                        }
                    },
                    {
                        $group: {
                            _id: "$selectedSlots.turfId" // Step 4: Group by turfId
                        }
                    },
                    {
                        $group: {
                            _id: null,
                            totalTurfs: { $sum: 1 } // Step 5: Count unique turfs
                        }
                    }
                ]);
                const revenueData = yield BookingModel_1.default.aggregate([
                    {
                        $match: {
                            companyId: new mongoose_1.default.Types.ObjectId(companyId),
                            totalAmount: { $gt: 0 }
                        }
                    },
                    {
                        $unwind: "$selectedSlots"
                    },
                    {
                        $match: {
                            "selectedSlots.date": { $gte: from, $lte: to },
                            "selectedSlots.isCancelled": false
                        }
                    },
                    {
                        $group: {
                            _id: {
                                date: { $dateToString: { format: "%Y-%m-%d", date: "$selectedSlots.date" } },
                                turfId: "$selectedSlots.turfId"
                            },
                            revenue: { $sum: "$selectedSlots.price" },
                        }
                    },
                    {
                        $unset: "data._id" // Remove unnecessary _id field from nested objects
                    },
                    {
                        $sort: { "_id.date": -1 } // Sort by date descending
                    },
                    { $skip: skip },
                    { $limit: Number(limit) }
                ]);
                if (!revenueData.length) {
                    return [];
                }
                // Filter out invalid turfId values
                const validRevenueData = revenueData.filter(item => item._id && item._id.turfId);
                const turfIds = [...new Set(validRevenueData.map(item => item._id.turfId))];
                // Fetch Turf details
                const turfs = yield TurfModel_1.default.find({ _id: { $in: turfIds } }).select("turfName location images");
                // Merge revenue data with Turf details
                const formattedRevenue = validRevenueData.map(revenue => {
                    const turf = turfs.find(turf => turf._id.toString() === revenue._id.turfId.toString());
                    return {
                        date: revenue._id.date,
                        revenue: revenue.revenue,
                        turfName: turf ? turf.turfName : "Unknown",
                        location: turf ? turf.location : "Unknown",
                        images: turf ? turf.images : []
                    };
                });
                // Compute total revenue and bookings
                const totalRevenue = formattedRevenue.reduce((sum, entry) => sum + entry.revenue, 0);
                const totalTurfCount = totalTurfCountQry.length > 0 ? totalTurfCountQry[0] : { totalTurfs: 0 };
                return {
                    totalTurfCount,
                    totalRevenue,
                    totalBookings: totalRevenues.length,
                    details: formattedRevenue
                };
                // return result;
            }
            catch (error) {
                console.log("THis is the Error of getRevenuByIntervAK :", error);
                throw new errors_1.ErrorResponse(error.message, StatusCode_1.StatusCode.INTERNAL_SERVER_ERROR);
            }
        });
    }
}
exports.CompanyRepository = CompanyRepository;
