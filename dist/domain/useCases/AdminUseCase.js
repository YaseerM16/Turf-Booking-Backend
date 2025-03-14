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
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminUseCase = void 0;
const config_1 = require("../../config/config");
const StatusCode_1 = require("../../shared/enums/StatusCode");
const errors_1 = require("../../shared/utils/errors");
// import { Admin } from "../entities/Admin";
config_1.config;
class AdminUseCase {
    constructor(adminRepository) {
        this.adminRepository = adminRepository;
    }
    adminLogin(email, password) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!email || !password) {
                    throw new Error("Credentials are not email or password are not getting");
                }
                if (email === config_1.config.ADMIN_EMAIL && password === config_1.config.ADMIN_PASSWORD) {
                    return { verified: true, email };
                }
                else {
                    return { verified: false };
                }
            }
            catch (error) {
                throw new errors_1.ErrorResponse(error.message, error.status);
            }
        });
    }
    getUsers(page, limit, searchQry, filter) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const users = yield this.adminRepository.getAllUsers(page, limit, searchQry, filter);
                const usersData = users.users;
                return { users: usersData, totalUsers: users.totalUsers };
            }
            catch (error) {
                throw new errors_1.ErrorResponse(error.message, error.status);
            }
        });
    }
    getRegisteredCompanies(page, limit, searchQry) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const companies = yield this.adminRepository.getRegisteredCompany(page, limit, searchQry);
                const companiesDet = companies.companies;
                return { companies: companiesDet, totalCompanies: companies.totalCompany };
            }
            catch (error) {
                throw new errors_1.ErrorResponse(error.message, error.status);
            }
        });
    }
    getApprovedCompanies(page, limit, searchQry, filter) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const companies = yield this.adminRepository.getApprovedCompany(page, limit, searchQry, filter);
                const companiesDet = companies.companies;
                return { companies: companiesDet, totalCompanies: companies.totalCompany };
            }
            catch (error) {
                throw new errors_1.ErrorResponse(error.message, error.status);
            }
        });
    }
    isBlocked(email, userId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!email || !userId) {
                    throw new Error("Email is required but was not provided.");
                }
                const user = yield this.adminRepository.isBlocked(email, userId);
                if (!user) {
                    return { success: false, message: "User not found or error fetching data" };
                }
                return user;
            }
            catch (error) {
                throw new errors_1.ErrorResponse(error.message, error.status);
            }
        });
    }
    companyBlockToggle(email, companyId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!email || !companyId) {
                    throw new Error("Email or companyId is required but was not provided.");
                }
                const company = yield this.adminRepository.companyBlockToggle(companyId, email);
                if (!company) {
                    return { success: false, message: "Company not found or error fetching data" };
                }
                return company;
            }
            catch (error) {
                throw new errors_1.ErrorResponse(error.message, error.status);
            }
        });
    }
    approveCompany(companyId, companyEmail) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!companyId || !companyEmail) {
                    throw new Error("Credentials(cmpnyId and cmpnyEmail) is required but was not provided.");
                }
                const isApproved = yield this.adminRepository.approveTheCompany(companyId, companyEmail);
                if (!isApproved) {
                    throw new Error("Company not found or update failed.");
                }
                return isApproved;
            }
            catch (error) {
                throw new errors_1.ErrorResponse(error.message, error.status);
            }
        });
    }
    getDashboardData() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const dashboardData = yield this.adminRepository.getDashboardData();
                if (!dashboardData) {
                    throw new Error("Could not found or fetch the Dash board data of Admin.");
                }
                return dashboardData;
            }
            catch (error) {
                throw new errors_1.ErrorResponse(error.message, error.status);
            }
        });
    }
    getMonthlyRevenue() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const monthlyRevenue = yield this.adminRepository.getMonthlyRevenue();
                if (!monthlyRevenue) {
                    throw new Error("Could not found or fetch the Dash board data of Admin.");
                }
                return monthlyRevenue;
            }
            catch (error) {
                throw new errors_1.ErrorResponse(error.message, error.status);
            }
        });
    }
    getRevenueByRange(fromDate, toDate) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const revenuesByRange = yield this.adminRepository.getRevenueByRange(fromDate, toDate);
                if (!revenuesByRange) {
                    throw new Error("Could not found or fetch the Range wise Revenues data of Admin.");
                }
                return revenuesByRange;
            }
            catch (error) {
                throw new errors_1.ErrorResponse(error.message, error.status);
            }
        });
    }
    ///SUbscirption ////
    addSubscriptionPlan(plan) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
            }
            catch (error) {
                throw new errors_1.ErrorResponse(error.message, error.status);
            }
            throw new Error("Method not implemented.");
        });
    }
    // /Sales Report/ //
    getLastMonthRevenue(page, limit) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!page || !limit) {
                    throw new errors_1.ErrorResponse("Page or Limit is required to fetch revenue data!", StatusCode_1.StatusCode.BAD_REQUEST);
                }
                const revenues = yield this.adminRepository.getLast30DaysRevenue(page, limit);
                return revenues;
            }
            catch (error) {
                throw new errors_1.ErrorResponse(error.message, StatusCode_1.StatusCode.INTERNAL_SERVER_ERROR);
            }
        });
    }
    getRevenuesByDateRange(fromDate, toDate, page, limit) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!page || !limit) {
                    throw new errors_1.ErrorResponse("Page or Limit is required to fetch revenue data!", StatusCode_1.StatusCode.BAD_REQUEST);
                }
                const revenues = yield this.adminRepository.getRevenuesByDateRange(fromDate, toDate, page, limit);
                return revenues;
            }
            catch (error) {
                throw new errors_1.ErrorResponse(error.message, StatusCode_1.StatusCode.INTERNAL_SERVER_ERROR);
            }
        });
    }
}
exports.AdminUseCase = AdminUseCase;
