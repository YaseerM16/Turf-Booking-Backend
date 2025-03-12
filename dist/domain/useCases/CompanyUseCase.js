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
exports.CompanyUseCase = void 0;
const errors_1 = require("../../shared/utils/errors");
const PasswordService_1 = require("../../infrastructure/services/PasswordService");
const StatusCode_1 = require("../../shared/enums/StatusCode");
class CompanyUseCase {
    constructor(companyRepository, mailService) {
        this.companyRepository = companyRepository;
        this.mailService = mailService;
    }
    RegisterCompany(company) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const existingCompany = yield this.companyRepository.findByEmail(company.companyemail);
                if (existingCompany)
                    throw new errors_1.ErrorResponse("Company aldready registered", 400);
                if (company.password) {
                    const hashedPassword = yield (0, PasswordService_1.generateHashPassword)(company.password);
                    company.password = hashedPassword;
                }
                const newCompany = yield this.companyRepository.create(company);
                const plainUser = {
                    id: newCompany._id,
                    companyemail: newCompany.companyemail,
                    companyname: newCompany.companyname,
                    role: "company"
                };
                if (!newCompany.googleId) {
                    yield this.mailService.accountVerifyMail(plainUser, "verifyEmail");
                }
                return newCompany;
            }
            catch (error) {
                throw new errors_1.ErrorResponse(error.message, error.status);
            }
        });
    }
    verifyMail(type, token, email) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const company = yield this.companyRepository.findByEmail(email);
                if (type === "verifyEmail" && (company === null || company === void 0 ? void 0 : company.verifyTokenExpiry)) {
                    const date = company.verifyTokenExpiry.getTime();
                    if (date < Date.now()) {
                        throw new errors_1.ErrorResponse("Token expired", 400);
                    }
                    if (company.verifyToken === token) {
                        const data = {
                            isVerified: true,
                            verifyToken: "",
                            verifyTokenExpiry: "",
                        };
                        let updatedCompany = yield this.companyRepository.update(company._id.toString(), data);
                        return updatedCompany;
                    }
                    else {
                        throw new errors_1.ErrorResponse("Invalid verification token", 400);
                    }
                }
                else if (type === "forgotPassword" && (company === null || company === void 0 ? void 0 : company.forgotPasswordTokenExpiry)) {
                    const date = company.forgotPasswordTokenExpiry.getTime();
                    if (date < Date.now()) {
                        throw new errors_1.ErrorResponse("Token expired", 400);
                    }
                    if (company.forgotPasswordToken === token) {
                        const data = {
                            isVerified: true,
                            forgotPasswordToken: "",
                            verifyTokenExforgotPasswordTokenExpirypiry: "",
                        };
                        let updatedCompany = yield this.companyRepository.update(company._id.toString(), data);
                        return updatedCompany;
                    }
                    else {
                        throw new errors_1.ErrorResponse("Invalid password reset token", 400);
                    }
                }
                return company;
            }
            catch (error) {
                throw new errors_1.ErrorResponse(error.message, error.status);
            }
        });
    }
    companyLogin(email, password) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let company = yield this.companyRepository.findByEmail(email);
                if (!company || !company.password) {
                    throw new errors_1.ErrorResponse("Company doesn't exist try Register company..!", 404);
                }
                const passwordMatch = yield (0, PasswordService_1.comparePassword)(password, company.password);
                if (!passwordMatch) {
                    throw new errors_1.ErrorResponse("password dosen't match", 400);
                }
                if (!company.isActive) {
                    throw new errors_1.ErrorResponse("Your Company Account is Blocked...!", 404);
                }
                return company;
            }
            catch (error) {
                throw new errors_1.ErrorResponse(error.message, error.status);
            }
        });
    }
    forgotPassword(email) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const company = yield this.companyRepository.findByEmail(email);
                if (!company) {
                    throw new errors_1.ErrorResponse("company not found", 404);
                }
                const plainUser = {
                    id: company._id,
                    companyemail: company.companyemail,
                    companyname: company.companyname,
                    role: "company"
                };
                yield this.mailService.accountVerifyMail(plainUser, "forgotPassword");
                return;
            }
            catch (error) {
                throw new errors_1.ErrorResponse(error.message, error.status);
            }
        });
    }
    updatePassword(email, password) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const hashedPassword = yield (0, PasswordService_1.generateHashPassword)(password);
                const company = yield this.companyRepository.findByEmail(email);
                const updatedCompany = yield this.companyRepository.update(company === null || company === void 0 ? void 0 : company._id.toString(), {
                    password: hashedPassword,
                });
                return updatedCompany;
            }
            catch (error) {
                throw new errors_1.ErrorResponse(error.message, error.status);
            }
        });
    }
    updateProfileImage(companyId, imageUrl) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const data = { profilePicture: imageUrl };
                const company = yield this.companyRepository.update(companyId, data);
                if (!company) {
                    throw new errors_1.ErrorResponse("Company not found or update failed", 404); // Handling not found
                }
                return company;
            }
            catch (error) {
            }
            throw new Error("Method not implemented.");
        });
    }
    updateProfileDetails(companyId, data) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const company = yield this.companyRepository.update(companyId, data);
                if (!company) {
                    throw new errors_1.ErrorResponse("User not found or update failed", 404); // Handling not found
                }
                return company;
            }
            catch (error) {
                throw new errors_1.ErrorResponse(error.message, error.status);
            }
        });
    }
    ///   <-   Turf    ->   ///
    registerTurf(turfDetails) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const workingDaysArr = JSON.parse(turfDetails === null || turfDetails === void 0 ? void 0 : turfDetails.workingDays);
                // Parse and transform workingDays to match the new schema
                const price = Number(turfDetails === null || turfDetails === void 0 ? void 0 : turfDetails.price);
                const workingDays = JSON.parse(turfDetails === null || turfDetails === void 0 ? void 0 : turfDetails.workingDays).map((day) => ({
                    day,
                    fromTime: turfDetails.fromTime, // Assign specific fromTime
                    toTime: turfDetails.toTime, // Assign specific toTime
                    price // Include the array of days
                }));
                const workingSlots = {
                    fromTime: turfDetails.fromTime, // Add parent-level fromTime
                    toTime: turfDetails.toTime, // Add parent-level toTime
                    workingDays,
                };
                const images = turfDetails === null || turfDetails === void 0 ? void 0 : turfDetails.images;
                const location = JSON.parse(turfDetails === null || turfDetails === void 0 ? void 0 : turfDetails.location);
                const facilities = JSON.parse(turfDetails === null || turfDetails === void 0 ? void 0 : turfDetails.selectedFacilities);
                const supportedGames = JSON.parse(turfDetails === null || turfDetails === void 0 ? void 0 : turfDetails.games);
                const turf = {
                    companyId: turfDetails.companyId,
                    turfName: turfDetails.turfName,
                    address: turfDetails.address,
                    description: turfDetails.description,
                    turfSize: turfDetails.turfSize,
                    turfType: turfDetails.turfType,
                    price,
                    images,
                    facilities,
                    supportedGames,
                    location,
                    workingSlots,
                };
                const isRegistered = yield this.companyRepository.registerTurf(turf, workingDaysArr);
                return isRegistered;
            }
            catch (error) {
                throw new errors_1.ErrorResponse(error.message, error.status);
            }
        });
    }
    editTurf(turfDetails) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const facilities = JSON.parse(turfDetails === null || turfDetails === void 0 ? void 0 : turfDetails.selectedFacilities);
                const price = Number(turfDetails === null || turfDetails === void 0 ? void 0 : turfDetails.price);
                const supportedGames = JSON.parse(turfDetails === null || turfDetails === void 0 ? void 0 : turfDetails.games);
                const turfId = JSON.parse(turfDetails.turfId);
                const images = (turfDetails === null || turfDetails === void 0 ? void 0 : turfDetails.images) && turfDetails.images.length > 0
                    ? turfDetails.images
                    : undefined;
                const turf = Object.assign(Object.assign({ companyId: turfDetails.companyId, turfName: turfDetails.turfName, description: turfDetails.description, turfSize: turfDetails.turfSize, turfType: turfDetails.turfType, price }, (images && { images })), { facilities,
                    supportedGames });
                const isUpdated = yield this.companyRepository.editTurfById(turfId, turf);
                return isUpdated;
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
                const turfs = yield this.companyRepository.getTurfs(companyId);
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
                    throw new errors_1.ErrorResponse("turfId is not Provided :", 500);
                const isBlocked = yield this.companyRepository.blockTurf(turfId);
                if (isBlocked.success) {
                    return isBlocked;
                }
                return { success: false };
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
                    throw new errors_1.ErrorResponse("turfId is not Provided :", 500);
                const isBlocked = yield this.companyRepository.unBlockTurf(turfId);
                if (isBlocked.success) {
                    return isBlocked;
                }
                return { success: false };
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
                    throw new errors_1.ErrorResponse("TurfId or companyID were not Provided :", 500);
                const turfObject = yield this.companyRepository.getTurfById(companyId, turfId);
                return turfObject;
            }
            catch (error) {
                throw new errors_1.ErrorResponse(error.message, error.status);
            }
        });
    }
    deleteTurfImage(turfId, index) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!turfId || index === undefined || index === null)
                    throw new errors_1.ErrorResponse("TurfId or Index is not Provided :", 500);
                const resultantArr = yield this.companyRepository.deleteTurfImage(turfId, index);
                return resultantArr;
            }
            catch (error) {
                throw new errors_1.ErrorResponse(error.message, error.status);
            }
        });
    }
    ///   <-  Slot  ->   ///
    getSlotsByDay(turfId, day, date) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const slots = yield this.companyRepository.getSlotByDay(turfId, day, date);
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
                    throw new errors_1.ErrorResponse("TurfId or SlotId is not Provided :", 500);
                const isUnavailed = yield this.companyRepository.makeSlotUnavail(slotId, turfId);
                if (isUnavailed.success) {
                    return isUnavailed;
                }
                return { success: false };
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
                    throw new errors_1.ErrorResponse("TurfId or SlotId is not Provided :", 500);
                const isAvailed = yield this.companyRepository.makeSlotAvail(slotId, turfId);
                if (isAvailed.success) {
                    return isAvailed;
                }
                return { success: false };
            }
            catch (error) {
                throw new errors_1.ErrorResponse(error.message, error.status);
            }
        });
    }
    addWorkingDays(turfId, payload) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { workingDays, fromTime, toTime, price } = payload;
                if (!workingDays || !fromTime || !toTime || !turfId || !price) {
                    throw new errors_1.ErrorResponse("Payload data for adding days is missing  :", 500);
                }
                const isDaysAdded = yield this.companyRepository.addWorkingDays(turfId, payload);
                if (isDaysAdded === null || isDaysAdded === void 0 ? void 0 : isDaysAdded.success) {
                    return isDaysAdded;
                }
                throw new errors_1.ErrorResponse("Something Went Wrong While Updating Add Working Days  :", 500);
            }
            catch (error) {
                throw new errors_1.ErrorResponse(error.message, error.status);
            }
        });
    }
    getDayDetails(turfId, day) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!turfId || !day) {
                    throw new errors_1.ErrorResponse("TurfId or the Day is not Getting  :", 500);
                }
                const dayDetails = yield this.companyRepository.getDayDetails(turfId, day);
                if (!dayDetails) {
                    throw new errors_1.ErrorResponse("TurfId or the Day is not Getting  :", 500);
                }
                return dayDetails;
            }
            catch (error) {
                throw new errors_1.ErrorResponse(error.message, error.status);
            }
        });
    }
    editDayDetails(turfId, updates) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!turfId || !updates) {
                    throw new errors_1.ErrorResponse("TurfId or the Updates Object is not Getting  :", 500);
                }
                const isUpdated = yield this.companyRepository.editDayDetails(turfId, updates);
                return isUpdated;
            }
            catch (error) {
                throw new errors_1.ErrorResponse(error.message, error.status);
            }
        });
    }
    createChatRoom(companyId, userId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!companyId || !userId)
                    throw new errors_1.ErrorResponse("CompanyId or UserId is not Getting while Creating chat Room ..!:", StatusCode_1.StatusCode.INTERNAL_SERVER_ERROR);
                const room = yield this.companyRepository.createChatRoom(companyId, userId);
                return room;
            }
            catch (error) {
                throw new errors_1.ErrorResponse(error.message, error.status);
            }
        });
    }
    getChatLists(companyId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!companyId)
                    throw new errors_1.ErrorResponse("CompanyId is not Getting while Getting chat Rooms ..!:", StatusCode_1.StatusCode.INTERNAL_SERVER_ERROR);
                const chatRooms = yield this.companyRepository.getChatRooms(companyId);
                return chatRooms;
            }
            catch (error) {
                throw new errors_1.ErrorResponse(error.message, error.status);
            }
        });
    }
    getChatMessages(roomId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!roomId)
                    throw new errors_1.ErrorResponse("roomID is not Getting while Getting Room Chats ..!:", StatusCode_1.StatusCode.INTERNAL_SERVER_ERROR);
                const messages = yield this.companyRepository.getChatMessages(roomId);
                return messages;
            }
            catch (error) {
                throw new errors_1.ErrorResponse(error.message, error.status);
            }
        });
    }
    onSendMessage(companyId, userId, data) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!companyId || !userId || !data)
                    throw new errors_1.ErrorResponse("CompanyId or UserId or data is not Getting while Try to Send Message ..!:", StatusCode_1.StatusCode.INTERNAL_SERVER_ERROR);
                const message = yield this.companyRepository.onSendMessage(companyId, userId, data);
                return message;
            }
            catch (error) {
                throw new errors_1.ErrorResponse(error.message, error.status);
            }
        });
    }
    getDashboardData(companyId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!companyId)
                    throw new errors_1.ErrorResponse("companyId is not getting for the Dashboard data fectching.. !!", StatusCode_1.StatusCode.BAD_REQUEST);
                const data = yield this.companyRepository.getDashboardData(companyId);
                return data;
            }
            catch (error) {
                throw new errors_1.ErrorResponse(error.message || "Error While Fetching the COmpany Dashbaord data ...!!", StatusCode_1.StatusCode.INTERNAL_SERVER_ERROR);
            }
        });
    }
    getMonthlyRevenue(companyId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!companyId)
                    throw new errors_1.ErrorResponse("companyId is not getting for the Monthly Revenue fectching.. !!", StatusCode_1.StatusCode.BAD_REQUEST);
                const monthlyRevenue = yield this.companyRepository.getMonthlyRevenue(companyId);
                return monthlyRevenue;
            }
            catch (error) {
                throw new errors_1.ErrorResponse(error.message || "Error While Fetching the COmpany Month wise revenue data ...!!", StatusCode_1.StatusCode.INTERNAL_SERVER_ERROR);
            }
        });
    }
    getRevenueByRange(companyId, fromDate, toDate) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!companyId || !fromDate || !toDate)
                    throw new errors_1.ErrorResponse("companyId or the date were not getting for the Range wise Revenue fectching.. !!", StatusCode_1.StatusCode.BAD_REQUEST);
                const revenues = yield this.companyRepository.getRevenueByRange(companyId, fromDate, toDate);
                return revenues;
            }
            catch (error) {
                throw new errors_1.ErrorResponse(error.message || "Error While Fetching the COmpany Month wise revenue data ...!!", StatusCode_1.StatusCode.INTERNAL_SERVER_ERROR);
            }
        });
    }
    getOverallRevenueByTurf(companyId, turfId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!companyId || !turfId)
                    throw new errors_1.ErrorResponse("companyId or turfId were not getting for the Turf Revenue fectching.. !!", StatusCode_1.StatusCode.BAD_REQUEST);
                const turfRevenue = yield this.companyRepository.getOverallRevenueByTurf(companyId, turfId);
                return turfRevenue;
            }
            catch (error) {
                throw new errors_1.ErrorResponse(error.message || "Error While Fetching the Turf revenue data ...!!", StatusCode_1.StatusCode.INTERNAL_SERVER_ERROR);
            }
        });
    }
    /// Sales Report 
    getLastMonthRevenue(companyId, page, limit) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // console.log("(cmpnyUseCase): calling getlastMonthRevenue :", companyId);
                if (!companyId)
                    throw new errors_1.ErrorResponse("companyId were not getting for the Company Sales Report data fectching.. !!", StatusCode_1.StatusCode.BAD_REQUEST);
                const revenues = yield this.companyRepository.getLastMonthRevenue(companyId, page, limit);
                return revenues;
            }
            catch (error) {
                throw new errors_1.ErrorResponse(error.message || "Error While Fetching the 30 days revenues for sales report data ...!!", StatusCode_1.StatusCode.INTERNAL_SERVER_ERROR);
            }
        });
    }
    getRevenuesByInterval(companyId, fromDate, toDate, page, limit) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!companyId || !fromDate || !toDate)
                    throw new errors_1.ErrorResponse("companyId or turfId were not getting for the Turf Revenue fectching.. !!", StatusCode_1.StatusCode.BAD_REQUEST);
                const revenues = yield this.companyRepository.getRevenuesByInterval(companyId, fromDate, toDate, page, limit);
                return revenues;
            }
            catch (error) {
                throw new errors_1.ErrorResponse(error.message || "Error While Fetching the 30 days revenues for sales report data ...!!", StatusCode_1.StatusCode.INTERNAL_SERVER_ERROR);
            }
        });
    }
}
exports.CompanyUseCase = CompanyUseCase;
