
// import {IAdminRepository} from

import { User } from "aws-sdk/clients/budgets";
import { Company } from "../../../domain/entities/Company";
import { IAdminRepository } from "../../../domain/repositories/IAdminRepository";
import CompanyModel from "../models/CompanyModel";
import UserModel from "../models/UserModel";
UserModel
CompanyModel

export class AdminRepository implements IAdminRepository {


    async getAllUsers(page: number, limit: number): Promise<{ users: any[]; totalUsers: number }> {
        try {
            const skip = (page - 1) * limit;
            const totalUsers = await UserModel.countDocuments();
            const users = await UserModel.find()
                .skip(skip)   // Skip documents
                .limit(limit) // Limit the number of documents returned
                .exec(); // Fetches all users from the database
            return { users: users, totalUsers };
        } catch (error: any) {
            throw new Error(`Error fetching users: ${error.message}`);
        }
    }
    async getRegisteredCompany(page: number, limit: number): Promise<{ companies: any[]; totalCompany: number; }> {
        try {
            const skip = (page - 1) * limit;
            const totalCompany = await CompanyModel.countDocuments();
            const companies = await CompanyModel.find({ isApproved: false })
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
            if (!userId) {
                return { success: false, message: "User ID is required" };
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

}