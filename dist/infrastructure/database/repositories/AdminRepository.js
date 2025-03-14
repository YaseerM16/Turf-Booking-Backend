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
exports.AdminRepository = void 0;
const CompanyModel_1 = __importDefault(require("../models/CompanyModel"));
const UserModel_1 = __importDefault(require("../models/UserModel"));
const TurfModel_1 = __importDefault(require("../models/TurfModel"));
const BookingModel_1 = __importDefault(require("../models/BookingModel"));
const errors_1 = require("../../../shared/utils/errors");
const StatusCode_1 = require("../../../shared/enums/StatusCode");
const date_fns_1 = require("date-fns");
const date_fns_2 = require("date-fns");
class AdminRepository {
    getAllUsers(page, limit, searchQry, filter) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const skip = (page - 1) * limit;
                const searchQuery = searchQry
                    ? {
                        $or: [
                            { name: { $regex: searchQry, $options: "i" } }, // Search by name (case-insensitive)
                            { email: { $regex: searchQry, $options: "i" } }, // Search by email (case-insensitive)
                        ],
                    }
                    : {};
                if (filter === "active") {
                    searchQuery.isActive = true; // Only active users
                }
                else if (filter === "inactive") {
                    searchQuery.isActive = false; // Only inactive users
                }
                const totalUsers = yield UserModel_1.default.countDocuments(searchQuery);
                const users = yield UserModel_1.default.find(searchQuery)
                    .skip(skip)
                    .limit(limit)
                    .exec();
                return { users: users, totalUsers };
            }
            catch (error) {
                throw new Error(`Error fetching users: ${error.message}`);
            }
        });
    }
    getRegisteredCompany(page, limit, searchQry) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const skip = (page - 1) * limit;
                const searchQuery = searchQry
                    ? {
                        $or: [
                            { companyname: { $regex: searchQry, $options: "i" } }, // Search by name (case-insensitive)
                            { companyemail: { $regex: searchQry, $options: "i" } }, // Search by email (case-insensitive)
                        ],
                    }
                    : {};
                const query = Object.assign({ isApproved: false }, searchQuery);
                const totalCompany = yield CompanyModel_1.default.countDocuments(query);
                const companies = yield CompanyModel_1.default.find(query)
                    .skip(skip) // Skip documents
                    .limit(limit) // Limit the number of documents returned
                    .exec();
                return { companies, totalCompany };
            }
            catch (error) {
                throw new Error(`Error fetching users: ${error.message}`);
            }
        });
    }
    getApprovedCompany(page, limit, searchQry, filter) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const skip = (page - 1) * limit;
                const searchQuery = searchQry
                    ? {
                        $or: [
                            { companyname: { $regex: searchQry, $options: "i" } }, // Search by name (case-insensitive)
                            { companyemail: { $regex: searchQry, $options: "i" } }, // Search by email (case-insensitive)
                        ],
                    }
                    : {};
                if (filter === "active") {
                    searchQuery.isActive = true; // Only active users
                }
                else if (filter === "inactive") {
                    searchQuery.isActive = false; // Only inactive users
                }
                const query = Object.assign({ isApproved: true }, searchQuery);
                const totalCompany = yield CompanyModel_1.default.countDocuments(query);
                const companies = yield CompanyModel_1.default.find(query)
                    .skip(skip) // Skip documents
                    .limit(limit) // Limit the number of documents returned
                    .exec();
                return { companies, totalCompany };
            }
            catch (error) {
                throw new Error(`Error fetching users: ${error.message}`);
            }
        });
    }
    isBlocked(email, userId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!userId || !email) {
                    throw new Error("UserId or email not found");
                }
                const user = yield UserModel_1.default.findOne({ _id: userId });
                if (!user) {
                    throw new Error("User not found");
                }
                const updatedBlockStatus = !user.isActive;
                const updatedUser = yield UserModel_1.default.findOneAndUpdate({ _id: userId }, { $set: { isActive: updatedBlockStatus } }, { new: true } // ✅ Returns the updated document
                );
                if (updatedUser) {
                    return updatedUser;
                }
                else {
                    return { success: false, message: "Failed to update block status" };
                }
            }
            catch (error) {
                throw new Error(`Error fetching users: ${error.message}`);
            }
        });
    }
    companyBlockToggle(companyId, companyEmail) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!companyId || !companyEmail) {
                    throw new Error("companyId or companyEmail are not found");
                }
                const company = yield CompanyModel_1.default.findOne({ _id: companyId });
                if (!company) {
                    throw new Error("company not found");
                }
                const updatedBlockStatus = !company.isActive;
                const updatedCompany = yield CompanyModel_1.default.findOneAndUpdate({ _id: companyId }, { $set: { isActive: updatedBlockStatus } }, { new: true } // Returns the updated document
                );
                if (updatedCompany) {
                    return updatedCompany;
                }
                else {
                    return { success: false, message: "Failed to update block status" };
                }
            }
            catch (error) {
                throw new Error(`Error fetching users: ${error.message}`);
            }
        });
    }
    approveTheCompany(companyId, companyEmail) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!companyId || !companyEmail) {
                    throw new Error("Credentials(cmpnyId and cmpnyEmail) is required but was not provided.");
                }
                const updatedCompany = yield CompanyModel_1.default.findOneAndUpdate({ _id: companyId, companyemail: companyEmail }, { isApproved: true }, { new: true });
                if (!updatedCompany) {
                    throw new Error("Company not found or update failed.");
                }
                return updatedCompany;
            }
            catch (error) {
                throw new Error(`Error fetching users: ${error.message}`);
            }
        });
    }
    getDashboardData() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const usersCount = yield UserModel_1.default.countDocuments({ isActive: true });
                const companyCount = yield CompanyModel_1.default.countDocuments({ isActive: true, isApproved: true });
                const turfsCount = yield TurfModel_1.default.countDocuments({ isBlocked: false, isDelete: false });
                const currentDate = new Date();
                const last7DaysStart = new Date();
                last7DaysStart.setDate(currentDate.getDate() - 7); // 7 days ago (excluding today)
                const last7DaysEnd = new Date();
                last7DaysEnd.setDate(currentDate.getDate() - 1); // Until yesterday
                const metrics = yield BookingModel_1.default.aggregate([
                    {
                        $match: { totalAmount: { $gt: 0 } } // Exclude fully canceled bookings
                    },
                    { $unwind: "$selectedSlots" }, // Work with individual slots
                    {
                        $group: {
                            _id: null,
                            totalBookings: { $sum: 1 }, // Count all bookings
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
                            last7DaysRevenue: 1
                        }
                    }
                ]);
                const metricsDet = metrics.length > 0
                    ? metrics[0]
                    : { totalBookings: 0, completedBookings: 0, upcomingBookings: 0, totalRevenue: 0 };
                return { metricsDet, usersCount, companyCount, turfsCount };
            }
            catch (error) {
                throw new Error(`Error fetching users: ${error.message}`);
            }
        });
    }
    getMonthlyRevenue() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const monthlyRevenue = yield BookingModel_1.default.aggregate([
                    {
                        $match: {
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
    getRevenueByRange(fromDate, toDate) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!fromDate || !toDate) {
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
    addSubscriptionPlan(plan) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
            }
            catch (error) {
                throw new errors_1.ErrorResponse(error.message, StatusCode_1.StatusCode.INTERNAL_SERVER_ERROR);
            }
            throw new Error("Method not implemented.");
        });
    }
    ///Sales
    getLastMonthRevenue(page, limit) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!page || !limit) {
                    throw new errors_1.ErrorResponse("Page or Limit is required to fetch revenue data!", StatusCode_1.StatusCode.BAD_REQUEST);
                }
                const skip = (Number(page) - 1) * limit;
                // Get last month's date range
                const lastMonthStart = (0, date_fns_1.startOfMonth)((0, date_fns_1.subMonths)(new Date(), 1));
                const lastMonthEnd = (0, date_fns_1.endOfMonth)((0, date_fns_1.subMonths)(new Date(), 1));
                // Aggregate revenue grouped by companyId
                const revenueData = yield BookingModel_1.default.aggregate([
                    {
                        $match: {
                            bookingDate: { $gte: lastMonthStart, $lte: lastMonthEnd },
                            status: "completed",
                            paymentStatus: "completed"
                        }
                    },
                    {
                        $group: {
                            _id: "$companyId",
                            totalRevenue: { $sum: "$totalAmount" },
                            totalBookings: { $sum: 1 }
                        }
                    },
                    {
                        $lookup: {
                            from: "companies",
                            localField: "_id",
                            foreignField: "_id",
                            as: "companyDetails"
                        }
                    },
                    {
                        $unwind: "$companyDetails"
                    },
                    {
                        $project: {
                            companyId: "$_id",
                            companyName: "$companyDetails.companyname",
                            companyEmail: "$companyDetails.companyemail",
                            companyPhone: "$companyDetails.phone",
                            totalRevenue: 1,
                            totalBookings: 1
                        }
                    },
                    { $sort: { totalRevenue: -1 } }, // Sort by highest revenue
                    { $skip: skip },
                    { $limit: Number(limit) }
                ]);
                return revenueData;
            }
            catch (error) {
                throw new errors_1.ErrorResponse(error.message, StatusCode_1.StatusCode.INTERNAL_SERVER_ERROR);
            }
        });
    }
    getLast30DaysRevenue(page, limit) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!page || !limit) {
                    throw new errors_1.ErrorResponse("Page or Limit is required to fetch revenue data!", StatusCode_1.StatusCode.BAD_REQUEST);
                }
                const skip = (Number(page) - 1) * limit;
                // Get the start date for the last 30 days
                const last30DaysStart = (0, date_fns_2.startOfDay)((0, date_fns_2.subDays)(new Date(), 30));
                const revenueData = yield BookingModel_1.default.aggregate([
                    {
                        $match: {
                            bookingDate: { $gte: last30DaysStart },
                            status: "completed",
                            paymentStatus: "completed"
                        }
                    },
                    {
                        $group: {
                            _id: { $dateToString: { format: "%Y-%m-%d", date: "$bookingDate" } },
                            totalRevenue: { $sum: "$totalAmount" },
                            totalBookings: { $sum: 1 }
                        }
                    },
                    { $sort: { _id: -1 } }, // Sort by date in descending order
                    {
                        $facet: {
                            paginatedResults: [{ $skip: skip }, { $limit: Number(limit) }], // Apply pagination
                            totalCount: [{ $count: "total" }] // Count total records before pagination
                        }
                    }
                ]);
                // Extract values
                const formattedRevenueData = revenueData[0].paginatedResults.map((item) => ({
                    date: (0, date_fns_1.format)(new Date(item._id), "EEE, MMM d, yyyy"), // Example: "Tue, Feb 18, 2025"
                    totalRevenue: item.totalRevenue,
                    totalBookings: item.totalBookings
                }));
                const totalRevenues = revenueData[0].totalCount.length > 0 ? revenueData[0].totalCount[0].total : 0;
                // Final Response
                return {
                    revenues: formattedRevenueData,
                    totalRevenues,
                };
            }
            catch (error) {
                throw new errors_1.ErrorResponse(error.message, StatusCode_1.StatusCode.INTERNAL_SERVER_ERROR);
            }
        });
    }
    getRevenuesByDateRange(fromDate, toDate, page, limit) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!fromDate || !toDate || !page || !limit) {
                    throw new errors_1.ErrorResponse("From Date, To Date, Page, and Limit are required!", StatusCode_1.StatusCode.BAD_REQUEST);
                }
                const skip = (Number(page) - 1) * limit;
                // Ensure valid date inputs
                const from = new Date(fromDate);
                const to = new Date(toDate);
                to.setHours(23, 59, 59, 999); // Include the full day of 'toDate'
                const revenueData = yield BookingModel_1.default.aggregate([
                    {
                        $match: {
                            bookingDate: { $gte: from, $lte: to },
                            status: "completed",
                            paymentStatus: "completed"
                        }
                    },
                    {
                        $group: {
                            _id: { $dateToString: { format: "%Y-%m-%d", date: "$bookingDate" } },
                            totalRevenue: { $sum: "$totalAmount" },
                            totalBookings: { $sum: 1 }
                        }
                    },
                    { $sort: { _id: -1 } }, // Sort by date descending
                    {
                        $facet: {
                            paginatedResults: [{ $skip: skip }, { $limit: Number(limit) }], // Apply pagination
                            totalCount: [{ $count: "total" }] // Get total count before pagination
                        }
                    }
                ]);
                // Extract formatted results
                const formattedRevenueData = revenueData[0].paginatedResults.map((item) => ({
                    date: (0, date_fns_1.format)(new Date(item._id), "EEE, MMM d, yyyy"), // Example: "Tue, Feb 18, 2025"
                    totalRevenue: item.totalRevenue,
                    totalBookings: item.totalBookings
                }));
                const totalRevenues = revenueData[0].totalCount.length > 0 ? revenueData[0].totalCount[0].total : 0;
                // Final Response
                return {
                    revenues: formattedRevenueData,
                    totalRevenues
                };
            }
            catch (error) {
                throw new errors_1.ErrorResponse(error.message, StatusCode_1.StatusCode.INTERNAL_SERVER_ERROR);
            }
        });
    }
}
exports.AdminRepository = AdminRepository;
