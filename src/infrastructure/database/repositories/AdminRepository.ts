
// import {IAdminRepository} from

import { User } from "aws-sdk/clients/budgets";
import { Company } from "../../../domain/entities/Company";
import { IAdminRepository } from "../../../domain/repositories/IAdminRepository";
import CompanyModel from "../models/CompanyModel";
import UserModel from "../models/UserModel";
UserModel
CompanyModel

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

}