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
exports.AdminController = void 0;
const express_validator_1 = require("express-validator");
const errors_1 = require("../../shared/utils/errors");
const config_1 = require("../../config/config");
const responseUtil_1 = require("../../shared/utils/responseUtil");
const StatusCode_1 = require("../../shared/enums/StatusCode");
class AdminController {
    constructor(adminUseCase, authService) {
        this.adminUseCase = adminUseCase;
        this.authService = authService;
    }
    adminLogin(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const errors = (0, express_validator_1.validationResult)(req);
                if (!errors.isEmpty()) {
                    throw new errors_1.ErrorResponse("Invalid email or password", 401);
                }
                const { email, password } = req.body;
                const admin = yield this.adminUseCase.adminLogin(email, password);
                if (admin.verified) {
                    const det = {
                        email: admin.email,
                        userRole: "admin"
                    };
                    const token = this.authService.generateToken(det);
                    const refreshToken = this.authService.generateRefreshToken(det);
                    res.cookie("AdminRefreshToken", refreshToken, {
                        httpOnly: true,
                        secure: config_1.config.MODE !== "development",
                        sameSite: "lax"
                    });
                    res.cookie("AdminToken", token, {
                        httpOnly: false,
                        secure: false,
                        sameSite: "lax",
                    });
                    res
                        .status(200)
                        .json({ success: true, message: "Logged In successfully", loggedIn: true });
                }
                else {
                    res
                        .status(501)
                        .json({ success: false, message: "Not Authenticated !", loggedIn: false });
                }
            }
            catch (error) {
                res.status(400).json({ message: error.message });
            }
        });
    }
    getUsers(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const page = parseInt(req.query.page) || 1; // Default to page 1 if not provided
                const limit = parseInt(req.query.limit) || 10;
                const searchQry = req.query.searchQry;
                const filter = req.query.filter || "all";
                const users = yield this.adminUseCase.getUsers(page, limit, searchQry, filter);
                res.status(200).json({ users: users.users, success: true, message: "Fetched Users successfully ", totalUsers: users.totalUsers });
            }
            catch (error) {
                res.status(400).json({ message: error.message });
            }
        });
    }
    userToggleBlock(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { userId, email } = req.params;
                // console.log("EMail nd UserID in TOGGLEBlock :", email, userId);
                if (!email || !userId) {
                    throw new Error("Email or user Id is required but was not provided.");
                }
                const user = yield this.adminUseCase.isBlocked(email, userId);
                (0, responseUtil_1.sendResponse)(res, true, "User Block Toggled Successfully", StatusCode_1.StatusCode.SUCCESS, { user });
                // res.status(200).json({ success: true, message: "User Block Toggled Successfully" });
            }
            catch (error) {
                // res.status(400).json({ message: (error as Error).message });
                (0, responseUtil_1.sendResponse)(res, false, "There's something went wrong while toggling the user block ..!", StatusCode_1.StatusCode.INTERNAL_SERVER_ERROR);
            }
        });
    }
    companyToggleBlock(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { email, companyId } = req.query;
                if (!email || !companyId) {
                    throw new Error("Email or companyId was not provided.");
                }
                const company = yield this.adminUseCase.companyBlockToggle(email, companyId);
                (0, responseUtil_1.sendResponse)(res, true, "Company Block Status Toggled Successfully", StatusCode_1.StatusCode.SUCCESS, { company });
                // if (!response.success) {
                //     res.status(500).json({ success: false, message: "something went wrong while toggle the company status :(" });
                //     return
                // }
                // res.status(200).json({ success: true, message: "Company Block Status Toggled Successfully" });
            }
            catch (error) {
                (0, responseUtil_1.sendResponse)(res, false, error.message, StatusCode_1.StatusCode.INTERNAL_SERVER_ERROR);
                // res.status(400).json({ message: (error as Error).message });
            }
        });
    }
    getRegisteredCompany(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const page = parseInt(req.query.page) || 1; // Default to page 1 if not provided
                const limit = parseInt(req.query.limit) || 10;
                const searchQry = req.query.searchQry;
                const companies = yield this.adminUseCase.getRegisteredCompanies(page, limit, searchQry);
                res.status(200).json({ companies: companies.companies, success: true, message: "Fetched Registered companies successfully ", totalCompany: companies.totalCompanies });
            }
            catch (error) {
                res.status(500).json({ message: 'Something went wrong during Fetch Verified Companies :' });
            }
        });
    }
    getApprovedCompany(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const page = parseInt(req.query.page) || 1; // Default to page 1 if not provided
                const limit = parseInt(req.query.limit) || 10;
                const searchQry = req.query.searchQry;
                const filter = req.query.filter || "all";
                // console.log("Query in Controller :", searchQry);
                const companies = yield this.adminUseCase.getApprovedCompanies(page, limit, searchQry, filter);
                res.status(200).json({ companies: companies.companies, success: true, message: "Fetched Approved companies successfully ", totalCompany: companies.totalCompanies });
            }
            catch (error) {
                res.status(500).json({ message: 'Something went wrong during Fetch Approved Companies :' });
            }
        });
    }
    approveCompany(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { companyId, companyEmail } = req.body;
                const isApproved = yield this.adminUseCase.approveCompany(companyId, companyEmail);
                res.status(200).json({ success: true, message: "Company Approved Successfully" });
            }
            catch (error) {
                console.error('Error during logout:', error);
                res.status(500).json({ message: 'Something went during Approving the Company :' });
            }
        });
    }
    logout(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                res.clearCookie('AdminToken');
                res.clearCookie('AdminRefreshToken');
                res.status(200).json({ message: 'Logged out successfully', loggedOut: true });
            }
            catch (error) {
                console.error('Error during logout:', error);
                res.status(500).json({ message: 'Something went wrong during logout' });
            }
        });
    }
    ;
    getDashboardData(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const dashboard = yield this.adminUseCase.getDashboardData();
                // res.status(200).json({ success: true, message: "Company Approved Successfully" });
                (0, responseUtil_1.sendResponse)(res, true, "Dashboard Data Fetched Successfully :", StatusCode_1.StatusCode.SUCCESS, { dashboard });
            }
            catch (error) {
                console.error('Error during logout:', error);
                // res.status(500).json({ message: 'Something went wrong during logout' });
                (0, responseUtil_1.sendResponse)(res, false, error.message, StatusCode_1.StatusCode.INTERNAL_SERVER_ERROR);
            }
        });
    }
    ;
    getMonthlyRevenues(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const monthlyRevenue = yield this.adminUseCase.getMonthlyRevenue();
                (0, responseUtil_1.sendResponse)(res, true, "Dashboard Data Fetched Successfully :", StatusCode_1.StatusCode.SUCCESS, { revenues: monthlyRevenue });
            }
            catch (error) {
                (0, responseUtil_1.sendResponse)(res, false, error.message, StatusCode_1.StatusCode.INTERNAL_SERVER_ERROR);
            }
        });
    }
    ;
    getRevenuesByRange(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { fromDate, toDate } = req.query;
                const rangeRevenues = yield this.adminUseCase.getRevenueByRange(fromDate, toDate);
                (0, responseUtil_1.sendResponse)(res, true, "Dashboard Data Fetched Successfully :", StatusCode_1.StatusCode.SUCCESS, { revenues: rangeRevenues });
            }
            catch (error) {
                (0, responseUtil_1.sendResponse)(res, false, error.message, StatusCode_1.StatusCode.INTERNAL_SERVER_ERROR);
            }
        });
    }
    ;
    addSubscriptionPlan(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                console.log("REqBoid of ADDSubcripts: :", req.body);
                // const rangeRevenues = await this.adminUseCase.getRevenueByRange(fromDate as unknown as Date, toDate as unknown as Date)
                // sendResponse(res, true, "Dashboard Data Fetched Successfully :", StatusCode.SUCCESS, { revenues: rangeRevenues })
            }
            catch (error) {
                (0, responseUtil_1.sendResponse)(res, false, error.message, StatusCode_1.StatusCode.INTERNAL_SERVER_ERROR);
            }
        });
    }
    ;
    //Sales Report ::
    getLastMonthRevenues(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { page, limit } = req.query;
                const monthlyRevenue = yield this.adminUseCase.getLastMonthRevenue(page, limit);
                (0, responseUtil_1.sendResponse)(res, true, "Dashboard Data Fetched Successfully :", StatusCode_1.StatusCode.SUCCESS, { revenues: monthlyRevenue });
            }
            catch (error) {
                (0, responseUtil_1.sendResponse)(res, false, error.message, StatusCode_1.StatusCode.INTERNAL_SERVER_ERROR);
            }
        });
    }
    ;
    getRevenuesByDateRage(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { page, limit, fromDate, toDate } = req.query;
                const revenues = yield this.adminUseCase.getRevenuesByDateRange(fromDate, toDate, page, limit);
                (0, responseUtil_1.sendResponse)(res, true, "Dashboard Data Fetched Successfully :", StatusCode_1.StatusCode.SUCCESS, { result: revenues });
            }
            catch (error) {
                (0, responseUtil_1.sendResponse)(res, false, error.message, StatusCode_1.StatusCode.INTERNAL_SERVER_ERROR);
            }
        });
    }
}
exports.AdminController = AdminController;
