
import { IAdminRepository } from "../../../domain/repositories/IAdminRepository";
import CompanyModel from "../models/CompanyModel";
import UserModel from "../models/UserModel";
import TurfModel from "../models/TurfModel";
import BookingModel from "../models/BookingModel";
import { ErrorResponse } from "../../../shared/utils/errors";
import { StatusCode } from "../../../shared/enums/StatusCode";
import { SubscriptionPlan } from "../../../domain/entities/SubscriptionPlan";
import { Company } from "../../../domain/entities/Company";

type SearchQuery = {
    $or?: { companyname?: { $regex: string; $options: string }; companyemail?: { $regex: string; $options: string } }[];
    isActive?: boolean;
};

export class AdminRepository implements IAdminRepository {

    async getAllUsers(page: number, limit: number, searchQry: string, filter: string): Promise<{ users: any[]; totalUsers: number }> {
        try {
            const skip = (page - 1) * limit;

            const searchQuery: any = searchQry
                ? {
                    $or: [
                        { name: { $regex: searchQry, $options: "i" } }, // Search by name (case-insensitive)
                        { email: { $regex: searchQry, $options: "i" } }, // Search by email (case-insensitive)
                    ],
                }
                : {};

            if (filter === "active") {
                searchQuery.isActive = true; // Only active users
            } else if (filter === "inactive") {
                searchQuery.isActive = false; // Only inactive users
            }

            const totalUsers = await UserModel.countDocuments(searchQuery);
            const users = await UserModel.find(searchQuery)
                .skip(skip)
                .limit(limit)
                .exec();
            return { users: users, totalUsers };
        } catch (error: any) {
            throw new Error(`Error fetching users: ${error.message}`);
        }
    }
    async getRegisteredCompany(page: number, limit: number, searchQry: string): Promise<{ companies: any[]; totalCompany: number; }> {
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

            const query = {
                isApproved: false,
                ...searchQuery,
            };


            const totalCompany = await CompanyModel.countDocuments(query);
            const companies = await CompanyModel.find(query)
                .skip(skip)   // Skip documents
                .limit(limit) // Limit the number of documents returned
                .exec();
            return { companies, totalCompany };

        } catch (error: any) {
            throw new Error(`Error fetching users: ${error.message}`);
        }
    }

    async getApprovedCompany(page: number, limit: number, searchQry: string, filter: string): Promise<{ companies: any[]; totalCompany: number; }> {
        try {
            const skip = (page - 1) * limit;
            const searchQuery: SearchQuery = searchQry
                ? {
                    $or: [
                        { companyname: { $regex: searchQry, $options: "i" } }, // Search by name (case-insensitive)
                        { companyemail: { $regex: searchQry, $options: "i" } }, // Search by email (case-insensitive)
                    ],
                }
                : {};

            if (filter === "active") {
                searchQuery.isActive = true; // Only active users
            } else if (filter === "inactive") {
                searchQuery.isActive = false; // Only inactive users
            }

            const query = {
                isApproved: true,
                ...searchQuery,
            };

            const totalCompany = await CompanyModel.countDocuments(query);
            const companies = await CompanyModel.find(query)
                .skip(skip)   // Skip documents
                .limit(limit) // Limit the number of documents returned
                .exec();
            return { companies, totalCompany };

        } catch (error: any) {
            throw new Error(`Error fetching users: ${error.message}`);
        }
    }

    async isBlocked(email: string, userId: string): Promise<object> {
        try {
            if (!userId || !email) {
                throw new Error("UserId or email not found");
            }

            const user = await UserModel.findOne({ _id: userId });

            if (!user) {
                throw new Error("User not found");
            }
            const updatedBlockStatus = !user.isActive

            const updateResult = await UserModel.updateOne({ _id: userId }, { $set: { isActive: updatedBlockStatus } });

            if (updateResult.modifiedCount > 0) {
                return { success: true };
            } else {
                return { success: false, message: "Failed to update block status" };
            }

        } catch (error: any) {
            throw new Error(`Error fetching users: ${error.message}`);
        }
    }

    async companyBlockToggle(companyId: string, companyEmail: string): Promise<object> {
        try {
            if (!companyId || !companyEmail) {
                throw new Error("companyId or companyEmail are not found");
            }

            const company = await CompanyModel.findOne({ _id: companyId });

            if (!company) {
                throw new Error("company not found");
            }

            const updatedBlockStatus = !company.isActive

            const updateResult = await CompanyModel.updateOne({ _id: companyId }, { $set: { isActive: updatedBlockStatus } });

            if (updateResult.modifiedCount > 0) {
                return { success: true };
            } else {
                return { success: false, message: "Failed to update block status" };
            }

        } catch (error: any) {
            throw new Error(`Error fetching users: ${error.message}`);
        }
    }


    async approveTheCompany(companyId: string, companyEmail: string): Promise<Company> {
        try {

            if (!companyId || !companyEmail) {
                throw new Error("Credentials(cmpnyId and cmpnyEmail) is required but was not provided.");
            }

            const updatedCompany = await CompanyModel.findOneAndUpdate({ _id: companyId, companyemail: companyEmail }, { isApproved: true }, { new: true })
            if (!updatedCompany) {
                throw new Error("Company not found or update failed.");
            }

            return updatedCompany;

        } catch (error: any) {
            throw new Error(`Error fetching users: ${error.message}`);
        }
    }

    async getDashboardData(): Promise<any> {
        try {
            const usersCount = await UserModel.countDocuments({ isActive: true })
            const companyCount = await CompanyModel.countDocuments({ isActive: true, isApproved: true })
            const turfsCount = await TurfModel.countDocuments({ isBlocked: false, isDelete: false })
            const currentDate = new Date();
            const last7DaysStart = new Date();
            last7DaysStart.setDate(currentDate.getDate() - 7); // 7 days ago (excluding today)
            const last7DaysEnd = new Date();
            last7DaysEnd.setDate(currentDate.getDate() - 1); // Until yesterday

            const metrics = await BookingModel.aggregate([
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
                : { totalBookings: 0, completedBookings: 0, upcomingBookings: 0, totalRevenue: 0 }

            return { metricsDet, usersCount, companyCount, turfsCount }

        } catch (error: any) {
            throw new Error(`Error fetching users: ${error.message}`);
        }
    }
    async getMonthlyRevenue(): Promise<any> {
        try {

            const monthlyRevenue = await BookingModel.aggregate([
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

        } catch (error) {
            throw new ErrorResponse((error as Error).message, StatusCode.INTERNAL_SERVER_ERROR);
        }
    }

    async getRevenueByRange(fromDate: Date, toDate: Date): Promise<any> {
        try {
            if (!fromDate || !toDate) {
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

    async addSubscriptionPlan(plan: SubscriptionPlan): Promise<SubscriptionPlan> {
        try {

        } catch (error) {
            throw new ErrorResponse((error as Error).message, StatusCode.INTERNAL_SERVER_ERROR);
        }
        throw new Error("Method not implemented.");
    }

}