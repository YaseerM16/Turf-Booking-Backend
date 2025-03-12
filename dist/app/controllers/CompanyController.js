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
exports.CompanyController = void 0;
const express_validator_1 = require("express-validator");
const errors_1 = require("../../shared/utils/errors");
const config_1 = require("../../config/config");
const TurfService_1 = __importDefault(require("../../infrastructure/services/TurfService"));
const responseUtil_1 = require("../../shared/utils/responseUtil");
const StatusCode_1 = require("../../shared/enums/StatusCode");
class CompanyController {
    constructor(companyUseCase, authService) {
        this.companyUseCase = companyUseCase;
        this.authService = authService;
    }
    registerCompany(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const errors = (0, express_validator_1.validationResult)(req);
                if (!errors.isEmpty()) {
                    throw new errors_1.ErrorResponse("Invalid email or password", 401);
                }
                const company = yield this.companyUseCase.RegisterCompany(req.body);
                const newCompany = Object.assign(Object.assign({}, JSON.parse(JSON.stringify(company))), { password: undefined });
                // res.status(200).json({ success: true, user: newCompany });
                (0, responseUtil_1.sendResponse)(res, true, "Company Registered Sccessfully :", StatusCode_1.StatusCode.SUCCESS, { user: newCompany });
            }
            catch (error) {
                (0, responseUtil_1.sendResponse)(res, false, error.message || "Error While Register the Company :!", StatusCode_1.StatusCode.BAD_REQUEST);
                // res.status(400).json({ message: (error as Error).message });
            }
        });
    }
    verifyAccount(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { type, token, email } = req.query;
                console.log("REq Query :", req.query);
                // console.log("type :", type, "token :", token, "email: ", email);
                const data = yield this.companyUseCase.verifyMail(type, token, email);
                if (data) {
                    if (type == "verifyEmail") {
                        const company = Object.assign(Object.assign({}, JSON.parse(JSON.stringify(data))), { password: undefined });
                        const det = {
                            _id: data === null || data === void 0 ? void 0 : data._id,
                            email: data === null || data === void 0 ? void 0 : data.companyemail,
                            userRole: "company"
                        };
                        const token = this.authService.generateToken(det);
                        const refreshToken = this.authService.generateRefreshToken(det);
                        res.cookie("CompanyRefreshToken", refreshToken, {
                            httpOnly: true,
                            secure: config_1.config.MODE !== "development",
                            sameSite: "lax"
                        });
                        res.cookie("CompanyToken", token, {
                            httpOnly: false,
                            secure: false,
                            sameSite: "lax",
                        });
                        (0, responseUtil_1.sendResponse)(res, true, "account verified", StatusCode_1.StatusCode.SUCCESS, { company, token, success: true });
                    }
                    else if (type == "forgotPassword") {
                        (0, responseUtil_1.sendResponse)(res, true, "account verified", StatusCode_1.StatusCode.SUCCESS, { token, forgotMail: true, success: true });
                    }
                }
            }
            catch (error) {
                // res.status(401).json({ message: (error as Error).message });
                (0, responseUtil_1.sendResponse)(res, false, error.message, StatusCode_1.StatusCode.UNAUTHORIZED);
            }
        });
    }
    companyLogin(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const errors = (0, express_validator_1.validationResult)(req);
                if (!errors.isEmpty()) {
                    throw new errors_1.ErrorResponse("Invalid email or password", 401);
                }
                const { email, password } = req.body;
                const company = yield this.companyUseCase.companyLogin(email, password);
                const companyData = Object.assign(Object.assign({}, JSON.parse(JSON.stringify(company))), { password: undefined });
                const det = {
                    _id: company === null || company === void 0 ? void 0 : company._id,
                    email: company === null || company === void 0 ? void 0 : company.companyemail,
                    userRole: "company"
                };
                const token = this.authService.generateToken(det);
                const refreshToken = this.authService.generateRefreshToken(det);
                res.cookie("CompanyRefreshToken", refreshToken, {
                    httpOnly: true,
                    secure: config_1.config.MODE !== "development",
                    sameSite: "lax"
                });
                res.cookie("CompanyToken", token, {
                    httpOnly: false,
                    secure: false,
                    sameSite: "lax",
                });
                (0, responseUtil_1.sendResponse)(res, true, "Logged In successfully", StatusCode_1.StatusCode.SUCCESS, { company: companyData, loggedIn: true });
            }
            catch (error) {
                (0, responseUtil_1.sendResponse)(res, false, error.message, StatusCode_1.StatusCode.UNAUTHORIZED);
            }
        });
    }
    forgotPassword(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { email } = req.body;
                console.log("Email in forgotpassword :", email);
                const data = yield this.companyUseCase.forgotPassword(email);
                (0, responseUtil_1.sendResponse)(res, true, "mail sent successfully", StatusCode_1.StatusCode.SUCCESS);
            }
            catch (error) {
                (0, responseUtil_1.sendResponse)(res, false, error.message, StatusCode_1.StatusCode.UNAUTHORIZED);
            }
        });
    }
    passwordUpdate(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { email, newPassword } = req.body;
                console.log("Email : ", email);
                console.log("Password : ", newPassword);
                const user = yield this.companyUseCase.updatePassword(email, newPassword);
                res.clearCookie('token');
                res.clearCookie('refreshToken');
                (0, responseUtil_1.sendResponse)(res, true, "Password Updated Successfully :)", StatusCode_1.StatusCode.SUCCESS);
            }
            catch (error) {
                (0, responseUtil_1.sendResponse)(res, false, error.message, StatusCode_1.StatusCode.INTERNAL_SERVER_ERROR);
            }
        });
    }
    logout(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                res.clearCookie('CompanyToken');
                res.clearCookie('CompanyRefreshToken');
                // res.status(200).json({ message: 'Logged out successfully', loggedOut: true });
                (0, responseUtil_1.sendResponse)(res, true, 'Logged out successfully', StatusCode_1.StatusCode.SUCCESS, { loggedOut: true });
            }
            catch (error) {
                console.error('Error during logout:', error);
                // res.status(500).json({ message: 'Something went wrong during logout' });
                (0, responseUtil_1.sendResponse)(res, false, error.message, StatusCode_1.StatusCode.INTERNAL_SERVER_ERROR);
            }
        });
    }
    ;
    registerTurf(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const images = (_a = req.files) === null || _a === void 0 ? void 0 : _a.TurfImages;
                const locations = images.map((image) => image.location);
                const isRegistered = yield this.companyUseCase.registerTurf(Object.assign(Object.assign({}, req.body), { images: locations }));
                // if (isRegistered) res.status(200).json({ success: true, turf: isRegistered });
                if (isRegistered)
                    (0, responseUtil_1.sendResponse)(res, true, "Turf has been registered successfully..!", StatusCode_1.StatusCode.SUCCESS, { turf: isRegistered });
            }
            catch (error) {
                console.error('Error during Register Turf:', error);
                // res.status(500).json({ message: 'Something went wrong during Register Turf :', error: error });
                (0, responseUtil_1.sendResponse)(res, false, error.message, StatusCode_1.StatusCode.INTERNAL_SERVER_ERROR);
            }
        });
    }
    updateDetails(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { companyId } = req.params;
                const company = yield this.companyUseCase.updateProfileDetails(companyId, req.body);
                if (!company) {
                    // res.status(404).json({ success: false, message: "User not found or update failed" });
                    (0, responseUtil_1.sendResponse)(res, false, "Company not found or update failed", StatusCode_1.StatusCode.NOT_FOUND);
                    return;
                }
                // res.status(200).send({ success: true, company });
                (0, responseUtil_1.sendResponse)(res, true, "Company details Updates successfully..!", StatusCode_1.StatusCode.SUCCESS, { company });
                return;
            }
            catch (error) {
                // res.status(500).json({ message: "Internal server error" });
                (0, responseUtil_1.sendResponse)(res, false, error.message, StatusCode_1.StatusCode.INTERNAL_SERVER_ERROR);
            }
        });
    }
    updateProfileImage(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            try {
                const { companyId } = req.params;
                const imageUrl = (_b = (_a = req.files) === null || _a === void 0 ? void 0 : _a.profileImage) === null || _b === void 0 ? void 0 : _b[0].location;
                if (!imageUrl) {
                    res.status(400).send("Profile image is required");
                }
                const company = yield this.companyUseCase.updateProfileImage(companyId, imageUrl);
                // res.status(200).send({ success: true, company });
                (0, responseUtil_1.sendResponse)(res, true, "Company's Profile picture Uploaded successfully..!", StatusCode_1.StatusCode.SUCCESS, { company });
            }
            catch (error) {
                // res.status(403).json({ message: (error as Error).message });
                (0, responseUtil_1.sendResponse)(res, false, error.message, StatusCode_1.StatusCode.FORBIDDEN);
            }
        });
    }
    getTurfs(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { companyId } = req.query;
                console.log("Gettinh Turfs : ", companyId);
                if (!companyId)
                    res.status(400).json({ success: false, message: "Cannot get the Company Id :" });
                const turfs = yield this.companyUseCase.getTurfs(companyId);
                // res.status(200).json({ success: true, turfs, message: "Turfs Fetched successfully :" });
                (0, responseUtil_1.sendResponse)(res, true, "Turfs Fetched successfully bruised :", StatusCode_1.StatusCode.SUCCESS, { turfs });
            }
            catch (error) {
                console.error('Error during Register Turf:', error);
                // res.status(500).json({ message: 'Something went wrong during Fetch the Turfs :', error: error });
                (0, responseUtil_1.sendResponse)(res, false, 'Something went wrong during Fetch the Turfs :', StatusCode_1.StatusCode.INTERNAL_SERVER_ERROR);
            }
        });
    }
    blockTurf(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { turfId } = req.query;
                if (!turfId)
                    res.status(400).json({ success: false, message: "Cannot get the Company Id :" });
                const isBlocked = yield this.companyUseCase.blockTurf(turfId);
                // res.status(200).json({ success: true, isBlocked, message: "Turfs Fetched successfully :" });
                (0, responseUtil_1.sendResponse)(res, true, "Turfs Fetched successfully :", StatusCode_1.StatusCode.SUCCESS, { isBlocked });
            }
            catch (error) {
                console.error('Error Block the Turf:', error);
                // res.status(500).json({ message: 'Something went wrong during Block the Turf :', error: error });
                (0, responseUtil_1.sendResponse)(res, false, error.message, StatusCode_1.StatusCode.INTERNAL_SERVER_ERROR, { error });
            }
        });
    }
    unBlockTurf(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { turfId } = req.query;
                if (!turfId)
                    res.status(400).json({ success: false, message: "Cannot get the Company Id :" });
                const isBlocked = yield this.companyUseCase.unBlockTurf(turfId);
                // res.status(200).json({ success: true, isBlocked, message: "Turfs Fetched successfully :" });
                (0, responseUtil_1.sendResponse)(res, true, "Turf UnBlocked successfully :", StatusCode_1.StatusCode.SUCCESS, { isBlocked });
            }
            catch (error) {
                console.error('Error Block the Turf:', error);
                // res.status(500).json({ message: 'Something went wrong during Block the Turf :', error: error });
                (0, responseUtil_1.sendResponse)(res, false, error.message, StatusCode_1.StatusCode.INTERNAL_SERVER_ERROR);
            }
        });
    }
    getTurfDetails(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { companyId, turfId } = req.params;
                if (!turfId)
                    res.status(200).json({ success: false, message: "Cannot get the Turf Id :" });
                const getTurf = yield this.companyUseCase.getTurfById(companyId, turfId);
                (0, responseUtil_1.sendResponse)(res, true, "Turf Fetched successfully :)", StatusCode_1.StatusCode.SUCCESS, { turf: getTurf });
            }
            catch (error) {
                console.log('Error during getting Turf Details :', error);
                (0, responseUtil_1.sendResponse)(res, false, error.message, StatusCode_1.StatusCode.INTERNAL_SERVER_ERROR);
            }
        });
    }
    deleteTurfImage(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { turfId, index } = req.params;
                if (!turfId || index === undefined || index === null) {
                    res.status(500).json({ success: false, message: "Cannot get the Turf Id or Index values :" });
                    return;
                }
                const resultArr = yield this.companyUseCase.deleteTurfImage(turfId, index);
                // res.status(200).json({ success: true, images: resultArr, message: "Turf Image Deleted successfully :" });
                (0, responseUtil_1.sendResponse)(res, true, "Turf Image Deleted successfully :", StatusCode_1.StatusCode.SUCCESS, { images: resultArr });
            }
            catch (error) {
                console.error('Error during delete Turf Image :', error);
                // res.status(500).json({ message: 'Something went wrong during Deleting the Turf Image :', error: error });
                (0, responseUtil_1.sendResponse)(res, false, "Something went wrong during Deleting the Turf Image :", StatusCode_1.StatusCode.INTERNAL_SERVER_ERROR, { error });
            }
        });
    }
    editTurf(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const images = (_a = req.files) === null || _a === void 0 ? void 0 : _a.TurfImages;
                let locations;
                if (images && images.length > 0) {
                    locations = images.map((image) => image.location);
                }
                const isUpdated = yield this.companyUseCase.editTurf(Object.assign(Object.assign({}, req.body), (locations && { images: locations })));
                // if (isUpdated) res.status(200).json({ success: true, turf: isUpdated });
                if (isUpdated)
                    (0, responseUtil_1.sendResponse)(res, true, "Turf Details has been updated Successfully :)", StatusCode_1.StatusCode.SUCCESS, { turf: isUpdated });
            }
            catch (error) {
                console.error('Error during Edit Turf Details :', error);
                // res.status(500).json({ message: 'Something went wrong during Edit the Turf Details :', error: error });
                (0, responseUtil_1.sendResponse)(res, false, "Something went wrong during Edit the Turf Details :", StatusCode_1.StatusCode.INTERNAL_SERVER_ERROR, { error });
            }
        });
    }
    getSlots(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { turfId, day, date } = req.query;
                const slots = yield this.companyUseCase.getSlotsByDay(turfId, day, date);
                // res.status(200).json({ success: true, slots, message: "Turf Slots by Day Fetched successfully :" });
                (0, responseUtil_1.sendResponse)(res, true, "Turf Slots by Day Fetched successfully :", StatusCode_1.StatusCode.SUCCESS, { slots });
            }
            catch (error) {
                // res.status(500).json({ message: error?.message });
                (0, responseUtil_1.sendResponse)(res, false, error.message, StatusCode_1.StatusCode.INTERNAL_SERVER_ERROR);
            }
        });
    }
    makeSlotUnavail(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { slotId, turfId } = req.query;
                const isUnavailed = yield this.companyUseCase.makeSlotUnavail(slotId, turfId);
                if (isUnavailed.success) {
                    // res.status(200).json({ success: true, result: isUnavailed, message: "Slot Unavailed successfully :" });
                    (0, responseUtil_1.sendResponse)(res, true, "Slot Unavailed successfully :", StatusCode_1.StatusCode.SUCCESS, { updatedSlot: isUnavailed });
                }
                // console.log("From the makeSlotUnavail :", slotId, turfId);
            }
            catch (error) {
                // res.status(500).json({ message: error?.message });
                (0, responseUtil_1.sendResponse)(res, false, error.message, StatusCode_1.StatusCode.INTERNAL_SERVER_ERROR);
            }
        });
    }
    makeSlotAvail(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { slotId, turfId } = req.query;
                const isAvailed = yield this.companyUseCase.makeSlotAvail(slotId, turfId);
                if (isAvailed.success) {
                    // res.status(200).json({ success: true, result: isAvailed, message: "Slot Unavailed successfully :" });
                    (0, responseUtil_1.sendResponse)(res, true, "Slot Unavailed successfully :", StatusCode_1.StatusCode.SUCCESS, { updatedSlot: isAvailed });
                }
                // console.log("From the makeSlotUnavail :", slotId, turfId);
            }
            catch (error) {
                // res.status(500).json({ message: error?.message });
                (0, responseUtil_1.sendResponse)(res, false, error.message, StatusCode_1.StatusCode.INTERNAL_SERVER_ERROR);
            }
        });
    }
    addWorkingDays(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { turfId } = req.params;
                const isDaysUpdated = yield this.companyUseCase.addWorkingDays(turfId, req.body);
                if (isDaysUpdated.success) {
                    // res.status(200).json({ success: true, result: isDaysUpdated, message: "Updated Working day successfully :" });
                    (0, responseUtil_1.sendResponse)(res, true, "Updated Working day successfully :", StatusCode_1.StatusCode.SUCCESS, { result: isDaysUpdated });
                }
                else {
                    // res.status(200).json({ success: false, message: "Failed to Updat the Working day !!! :" });
                    (0, responseUtil_1.sendResponse)(res, false, "Failed to Updat the Working day !!! :", StatusCode_1.StatusCode.NOT_FOUND);
                }
            }
            catch (error) {
                (0, responseUtil_1.sendResponse)(res, false, error.message, StatusCode_1.StatusCode.INTERNAL_SERVER_ERROR);
                // res.status(500).json({ message: error?.message });
            }
        });
    }
    getDetailsOfDay(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { turfId, day } = req.params;
                const dayDetails = yield this.companyUseCase.getDayDetails(turfId, day);
                res.status(200).json({ success: true, dayDetails, message: "Updated Working day successfully :" });
            }
            catch (error) {
                res.status(500).json({ message: error === null || error === void 0 ? void 0 : error.message });
            }
        });
    }
    genExampleOneDay(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { turfId } = req.params;
                const gens = yield TurfService_1.default.generateSlotsForNextDay(turfId);
                res.status(200).json({ success: true, message: "Updated Working day successfully :" });
            }
            catch (error) {
                res.status(500).json({ message: error === null || error === void 0 ? void 0 : error.message });
            }
        });
    }
    editWorkingDayDetails(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { turfId } = req.params;
                const isDayUpdated = yield this.companyUseCase.editDayDetails(turfId, req.body);
                res.status(200).json({ success: true, isDayUpdated, message: "Updated Working day successfully :" });
            }
            catch (error) {
                res.status(500).json({ message: error === null || error === void 0 ? void 0 : error.message });
            }
        });
    }
    createChatRoom(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { companyId, userId } = req.params;
                const room = yield this.companyUseCase.createChatRoom(companyId, userId);
                (0, responseUtil_1.sendResponse)(res, true, "Successfully created or got the chat room ..!", StatusCode_1.StatusCode.SUCCESS, { room });
            }
            catch (error) {
                (0, responseUtil_1.sendResponse)(res, false, error.message, StatusCode_1.StatusCode.INTERNAL_SERVER_ERROR);
            }
        });
    }
    getChatLists(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { companyId } = req.params;
                const chatRooms = yield this.companyUseCase.getChatLists(companyId);
                (0, responseUtil_1.sendResponse)(res, true, "Chat Lists Got Successfully ..!", StatusCode_1.StatusCode.SUCCESS, { rooms: chatRooms });
            }
            catch (error) {
                (0, responseUtil_1.sendResponse)(res, false, error.message, StatusCode_1.StatusCode.INTERNAL_SERVER_ERROR);
            }
        });
    }
    getChatMessages(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { roomId } = req.params;
                const messages = yield this.companyUseCase.getChatMessages(roomId);
                (0, responseUtil_1.sendResponse)(res, true, "Messages Fetched Successfully ..!", StatusCode_1.StatusCode.SUCCESS, { messages });
            }
            catch (error) {
                (0, responseUtil_1.sendResponse)(res, false, error.message, StatusCode_1.StatusCode.INTERNAL_SERVER_ERROR);
            }
        });
    }
    onSendMessage(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { companyId, userId } = req.params;
                const message = yield this.companyUseCase.onSendMessage(companyId, userId, req.body);
                (0, responseUtil_1.sendResponse)(res, true, "Message Sent Successfully to the User ..!", StatusCode_1.StatusCode.SUCCESS, { message });
            }
            catch (error) {
                (0, responseUtil_1.sendResponse)(res, false, error.message, StatusCode_1.StatusCode.INTERNAL_SERVER_ERROR);
            }
        });
    }
    getDashboardData(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { companyId } = req.params;
                const dashboardData = yield this.companyUseCase.getDashboardData(companyId);
                (0, responseUtil_1.sendResponse)(res, true, "Dashboard Data Fetched Successfully...!", StatusCode_1.StatusCode.SUCCESS, { dashboardData });
            }
            catch (error) {
                (0, responseUtil_1.sendResponse)(res, false, error.message, StatusCode_1.StatusCode.INTERNAL_SERVER_ERROR);
            }
        });
    }
    getMonthlyRevenue(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { companyId } = req.params;
                const monthlyRevenue = yield this.companyUseCase.getMonthlyRevenue(companyId);
                (0, responseUtil_1.sendResponse)(res, true, "Dashboard Data Fetched Successfully...!", StatusCode_1.StatusCode.SUCCESS, { monthlyRevenue });
            }
            catch (error) {
                (0, responseUtil_1.sendResponse)(res, false, error.message, StatusCode_1.StatusCode.INTERNAL_SERVER_ERROR);
            }
        });
    }
    getRevenueByRange(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { companyId } = req.params;
                const { fromDate, toDate } = req.query;
                const revenue = yield this.companyUseCase.getRevenueByRange(companyId, fromDate, toDate);
                (0, responseUtil_1.sendResponse)(res, true, "Dashboard Data Fetched Successfully...!", StatusCode_1.StatusCode.SUCCESS, { revenue });
            }
            catch (error) {
                (0, responseUtil_1.sendResponse)(res, false, error.message, StatusCode_1.StatusCode.INTERNAL_SERVER_ERROR);
            }
        });
    }
    getRevenuesByTurf(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { companyId, turfId } = req.params;
                const overallRevenues = yield this.companyUseCase.getOverallRevenueByTurf(companyId, turfId);
                (0, responseUtil_1.sendResponse)(res, true, "Revenues by the Turf Data Fetched Successfully...!", StatusCode_1.StatusCode.SUCCESS, { revenues: overallRevenues });
            }
            catch (error) {
                (0, responseUtil_1.sendResponse)(res, false, error.message, StatusCode_1.StatusCode.INTERNAL_SERVER_ERROR);
            }
        });
    }
    ///Sales Report :
    getLastMonthRevenues(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { companyId } = req.params;
                const { page, limit } = req.query;
                // console.log("(cmpnyControl): calling getlastMonthRevenue :", companyId);
                const revenues = yield this.companyUseCase.getLastMonthRevenue(companyId, page, limit);
                // console.log("This is the REVENUES in controller :", revenues);
                (0, responseUtil_1.sendResponse)(res, true, "Revenues by the Turf Data Fetched Successfully...!", StatusCode_1.StatusCode.SUCCESS, { revenues });
            }
            catch (error) {
                (0, responseUtil_1.sendResponse)(res, false, error.message, StatusCode_1.StatusCode.INTERNAL_SERVER_ERROR);
            }
        });
    }
    getRevenuesByInterval(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { companyId } = req.params;
                const { fromDate, toDate, page, limit } = req.query;
                const revenues = yield this.companyUseCase.getRevenuesByInterval(companyId, fromDate, toDate, page, limit);
                (0, responseUtil_1.sendResponse)(res, true, "Revenues by the Intervals got successful :", StatusCode_1.StatusCode.SUCCESS, { revenues });
            }
            catch (error) {
                (0, responseUtil_1.sendResponse)(res, false, error.message, StatusCode_1.StatusCode.INTERNAL_SERVER_ERROR);
            }
        });
    }
}
exports.CompanyController = CompanyController;
