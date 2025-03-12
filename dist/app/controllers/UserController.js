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
exports.UserController = void 0;
const errors_1 = require("../../shared/utils/errors");
const config_1 = require("../../config/config");
const express_validator_1 = require("express-validator");
const BookingService_1 = require("../../infrastructure/services/BookingService");
const StatusCode_1 = require("../../shared/enums/StatusCode");
const responseUtil_1 = require("../../shared/utils/responseUtil");
class UserController {
    constructor(userUseCase, authService) {
        this.userUseCase = userUseCase;
        this.authService = authService;
        this.getSignedUrlController = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                // const { files } = req.body;
                // console.log("Files for Upload PreSig :", req.body);
                // const urls = await getSignedUrlUseCase(files);
                const urls = yield this.userUseCase.getSignedUrlUseCase(req.body);
                (0, responseUtil_1.sendResponse)(res, true, "Presigned Url is Generated Successfully :!", StatusCode_1.StatusCode.SUCCESS, { urls });
            }
            catch (error) {
                (0, responseUtil_1.sendResponse)(res, false, error.message, StatusCode_1.StatusCode.INTERNAL_SERVER_ERROR);
            }
        });
    }
    registersUser(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                console.log("1111");
                const user = yield this.userUseCase.RegisterUser(req.body);
                const newUser = Object.assign(Object.assign({}, JSON.parse(JSON.stringify(user))), { password: undefined });
                // const response = new ResponseModel(true, "User Registered Successfully :)", { user: newUser })
                // res.status(StatusCode.SUCCESS).json(response)
                (0, responseUtil_1.sendResponse)(res, true, "User Registered Successfully ✅", StatusCode_1.StatusCode.SUCCESS, { user: newUser });
            }
            catch (error) {
                // const response = new ResponseModel(false, (error as Error).message)
                // res.status(StatusCode.BAD_REQUEST).json(response)
                (0, responseUtil_1.sendResponse)(res, false, error.message, StatusCode_1.StatusCode.BAD_REQUEST);
            }
        });
    }
    userLogin(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                console.log("LOGin by the Controooolllller is Called");
                const errors = (0, express_validator_1.validationResult)(req);
                if (!errors.isEmpty()) {
                    throw new errors_1.ErrorResponse("Invalid email or password", 401);
                }
                const { email, password } = req.body;
                const user = yield this.userUseCase.userLogin(email, password);
                const userData = Object.assign(Object.assign({}, JSON.parse(JSON.stringify(user))), { password: undefined });
                const det = {
                    _id: user === null || user === void 0 ? void 0 : user._id,
                    email: user === null || user === void 0 ? void 0 : user.email,
                    userRole: "user"
                };
                const token = this.authService.generateToken(det);
                const refreshToken = this.authService.generateRefreshToken(det);
                res.cookie("refreshToken", refreshToken, {
                    httpOnly: true,
                    secure: config_1.config.MODE === "production" ? true : false,
                    sameSite: config_1.config.MODE === "production" ? "none" : "lax",
                    domain: config_1.config.MODE === "production" ? 'turfbooking.online' : 'localhost'
                });
                res.cookie("token", token, {
                    httpOnly: false,
                    secure: config_1.config.MODE === "production" ? true : false,
                    sameSite: config_1.config.MODE === "production" ? "none" : "lax",
                    domain: config_1.config.MODE === "production" ? 'turfbooking.online' : 'localhost'
                });
                (0, responseUtil_1.sendResponse)(res, true, "Logged In Successfully ✅", StatusCode_1.StatusCode.SUCCESS, { user: userData, loggedIn: true });
            }
            catch (error) {
                console.log("Err res by Login:", error);
                (0, responseUtil_1.sendResponse)(res, false, error.message, StatusCode_1.StatusCode.BAD_REQUEST);
            }
        });
    }
    googleSingUp(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { email, displayName } = req.body;
                const user = yield this.userUseCase.googleRegister(email, displayName);
                const newUser = Object.assign(Object.assign({}, JSON.parse(JSON.stringify(user))), { password: undefined });
                // console.log("Google supg ", req.body);
                const det = {
                    _id: user === null || user === void 0 ? void 0 : user._id,
                    email: user === null || user === void 0 ? void 0 : user.email,
                    userRole: "user"
                };
                const token = this.authService.generateToken(det);
                const refreshToken = this.authService.generateRefreshToken(det);
                res.cookie("refreshToken", refreshToken, {
                    httpOnly: true,
                    secure: config_1.config.MODE === "production" ? true : false,
                    sameSite: config_1.config.MODE === "production" ? "none" : "lax",
                    domain: config_1.config.MODE === "production" ? 'turfbooking.online' : 'localhost'
                });
                res.cookie("token", token, {
                    httpOnly: false,
                    secure: config_1.config.MODE === "production" ? true : false,
                    sameSite: config_1.config.MODE === "production" ? "none" : "lax",
                    domain: config_1.config.MODE === "production" ? 'turfbooking.online' : 'localhost'
                });
                (0, responseUtil_1.sendResponse)(res, true, "Registered Successfully ..!✅", StatusCode_1.StatusCode.SUCCESS, { user: newUser });
            }
            catch (error) {
                (0, responseUtil_1.sendResponse)(res, false, error.message, StatusCode_1.StatusCode.FORBIDDEN);
            }
        });
    }
    googleLogin(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { email } = req.body;
                const user = yield this.userUseCase.googleLogin(email);
                const newUser = Object.assign(Object.assign({}, JSON.parse(JSON.stringify(user))), { password: undefined });
                // console.log("Google supg ", req.body);
                const det = {
                    _id: user === null || user === void 0 ? void 0 : user._id,
                    email: user === null || user === void 0 ? void 0 : user.email,
                    userRole: "user"
                };
                const token = this.authService.generateToken(det);
                const refreshToken = this.authService.generateRefreshToken(det);
                res.cookie("refreshToken", refreshToken, {
                    httpOnly: true,
                    secure: config_1.config.MODE === "production" ? true : false,
                    sameSite: config_1.config.MODE === "production" ? "none" : "lax",
                    domain: config_1.config.MODE === "production" ? 'turfbooking.online' : 'localhost'
                });
                res.cookie("token", token, {
                    httpOnly: false,
                    secure: config_1.config.MODE === "production" ? true : false,
                    sameSite: config_1.config.MODE === "production" ? "none" : "lax",
                    domain: config_1.config.MODE === "production" ? 'turfbooking.online' : 'localhost'
                });
                (0, responseUtil_1.sendResponse)(res, true, "Logged In Successfully ..!", StatusCode_1.StatusCode.SUCCESS, { user: newUser });
            }
            catch (error) {
                (0, responseUtil_1.sendResponse)(res, false, error.message, StatusCode_1.StatusCode.FORBIDDEN);
            }
        });
    }
    verifyAccount(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { type, token, email } = req.query;
                const data = yield this.userUseCase.verifyMail(type, token, email);
                if (data) {
                    if (type == "verifyEmail") {
                        const user = Object.assign(Object.assign({}, JSON.parse(JSON.stringify(data))), { password: undefined });
                        const creatWallet = yield this.userUseCase.createWallet(user === null || user === void 0 ? void 0 : user._id);
                        if (creatWallet === null || creatWallet === void 0 ? void 0 : creatWallet.success) {
                            const det = {
                                _id: user === null || user === void 0 ? void 0 : user._id,
                                email: user === null || user === void 0 ? void 0 : user.email,
                                userRole: "user"
                            };
                            const token = this.authService.generateToken(det);
                            const refreshToken = this.authService.generateRefreshToken(det);
                            res.cookie("refreshToken", refreshToken, {
                                httpOnly: true,
                                secure: config_1.config.MODE === "production" ? true : false,
                                sameSite: config_1.config.MODE === "production" ? "none" : "lax",
                                domain: config_1.config.MODE === "production" ? 'turfbooking.online' : 'localhost'
                            });
                            res.cookie("token", token, {
                                httpOnly: false,
                                secure: config_1.config.MODE === "production" ? true : false,
                                sameSite: config_1.config.MODE === "production" ? "none" : "lax",
                                domain: config_1.config.MODE === "production" ? 'turfbooking.online' : 'localhost'
                            });
                            res
                                .status(200)
                                .json({ success: true, message: "account verified", user, token });
                        }
                        else {
                            res.status(500).json({ message: "Internal server error while creating Wallet for this User :( " });
                        }
                    }
                    else if (type == "forgotPassword") {
                        res
                            .status(200)
                            .json({ success: true, message: "account verified", token, forgotMail: true });
                    }
                }
            }
            catch (error) {
                res.status(500).json({ message: "Internal server error", error });
            }
        });
    }
    getVerificationMail(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { userId } = req.params;
                yield this.userUseCase.sendVerificationMail(userId);
                res.status(200).json({ success: true, message: "Email was sent successfully :)" });
            }
            catch (error) {
                res.status(500).json({ message: "Internal server error while try to send the verification mail :", error });
            }
        });
    }
    getTopTurfs(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const topTurfs = yield this.userUseCase.topTurfs();
                (0, responseUtil_1.sendResponse)(res, true, "The Top Featured Turfs were fetched successfully ... :)", StatusCode_1.StatusCode.SUCCESS, { turfs: topTurfs });
            }
            catch (error) {
                (0, responseUtil_1.sendResponse)(res, false, error.message, StatusCode_1.StatusCode.INTERNAL_SERVER_ERROR);
            }
        });
    }
    updateProfileImage(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            try {
                const { userId } = req.params;
                const imageUrl = (_b = (_a = req.files) === null || _a === void 0 ? void 0 : _a.profileImage) === null || _b === void 0 ? void 0 : _b[0].location;
                if (!imageUrl) {
                    res.status(400).send("Profile image is required");
                }
                const user = yield this.userUseCase.updateProfileImage(userId, imageUrl);
                (0, responseUtil_1.sendResponse)(res, true, "Profile Image Updated Successfully ..✅", StatusCode_1.StatusCode.SUCCESS, { user });
            }
            catch (error) {
                (0, responseUtil_1.sendResponse)(res, false, error.message, StatusCode_1.StatusCode.FORBIDDEN);
            }
        });
    }
    updateDetails(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { userId } = req.params;
                const user = yield this.userUseCase.updateProfileDetails(userId, req.body);
                if (!user) {
                    (0, responseUtil_1.sendResponse)(res, false, "User not found or update failed !.. ❌", StatusCode_1.StatusCode.NOT_FOUND);
                    return;
                }
                (0, responseUtil_1.sendResponse)(res, true, "Profile has been Updated Successfully! ✅", StatusCode_1.StatusCode.SUCCESS, { user, success: true });
            }
            catch (error) {
                (0, responseUtil_1.sendResponse)(res, false, error.message, StatusCode_1.StatusCode.INTERNAL_SERVER_ERROR);
            }
        });
    }
    logout(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                res.clearCookie('token');
                res.clearCookie('refreshToken');
                res.status(200).json({ message: 'Logged out successfully', loggedOut: true });
            }
            catch (error) {
                console.error('Error during logout:', error);
                res.status(500).json({ message: 'Something went wrong during logout' });
            }
        });
    }
    ;
    forgotPassword(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { email } = req.body;
                console.log("Email in forgotpassword :", email);
                const data = yield this.userUseCase.forgotPassword(email);
                res
                    .status(200)
                    .json({ success: true, message: "mail send successfully" });
            }
            catch (error) {
                res.status(500).json({ message: error === null || error === void 0 ? void 0 : error.message });
            }
        });
    }
    passwordUpdate(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { email, newPassword } = req.body;
                console.log("Email : ", email);
                console.log("Password : ", newPassword);
                const user = yield this.userUseCase.updatePassword(email, newPassword);
                res.clearCookie('token');
                res.clearCookie('refreshToken');
                res.status(200).json({ success: true });
            }
            catch (error) {
                res.status(500).json({ message: error === null || error === void 0 ? void 0 : error.message });
            }
        });
    }
    getTurfs(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                console.log("THSE ENteredddd :");
                const query = req.query;
                // console.log("Queries in getTurfsofUser :", query);
                const turfs = yield this.userUseCase.getAllTurfs(query);
                (0, responseUtil_1.sendResponse)(res, true, "Turfs Fetched successfully ..!!", StatusCode_1.StatusCode.SUCCESS, { turfs: turfs.turfs, totalTurfs: turfs.totalTurfs });
                // res.status(200).json({ success: true, turfs: turfs.turfs, totalTurfs: turfs.totalTurfs, message: "Turfs Fetched successfully :" });
            }
            catch (error) {
                console.log("Erreo Etched   :", error);
                (0, responseUtil_1.sendResponse)(res, false, error.message, StatusCode_1.StatusCode.INTERNAL_SERVER_ERROR);
                // res.status(500).json({ message: error?.message });
            }
        });
    }
    getTurfDetails(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { turfId } = req.params;
                const turf = yield this.userUseCase.getTurfById(turfId);
                // res.status(200).json({ success: true, turf, message: "Turf Detail Fetched successfully :" });
                (0, responseUtil_1.sendResponse)(res, true, "Turf Detail Fetched successfully ..!", StatusCode_1.StatusCode.SUCCESS, { turf });
            }
            catch (error) {
                (0, responseUtil_1.sendResponse)(res, false, error.message, StatusCode_1.StatusCode.INTERNAL_SERVER_ERROR);
            }
        });
    }
    getSlots(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { turfId, day, date } = req.query;
                // console.log("by Date :", date);
                const slots = yield this.userUseCase.getSlotsByDay(turfId, day, date);
                (0, responseUtil_1.sendResponse)(res, true, "Turf Slots by Day Fetched successfully ..!", StatusCode_1.StatusCode.SUCCESS, { slots });
                // res.status(200).json({ success: true, slots, message: "Turf Slots by Day Fetched successfully :" });
            }
            catch (error) {
                (0, responseUtil_1.sendResponse)(res, false, error.message, StatusCode_1.StatusCode.INTERNAL_SERVER_ERROR);
                // res.status(500).json({ message: error?.message });
            }
        });
    }
    getPaymentHash(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // console.log("GET PYMENT HASH ");
                // console.log("REQuest BODY in getPaymntHash :", req.body);
                const { txnid, amount, productinfo, name: username, email, udf1, udf2, udf3, udf4, udf5, udf6, udf7 } = req.body;
                if (!txnid ||
                    !amount ||
                    !productinfo ||
                    !username ||
                    !email ||
                    !udf1 ||
                    !udf2 ||
                    !udf3 ||
                    !udf4) {
                    console.log("Some Field is NOT !!!");
                    res.status(400).send("Mandatory fields missing");
                    return;
                }
                const hash = yield (0, BookingService_1.generatePaymentHash)({
                    txnid, amount, productinfo, username, email, udf1, udf2, udf3, udf4, udf5, udf6, udf7,
                });
                // console.log('last', { hash, udf6, udf7 });
                res.send({ hash, udf6, udf7 });
            }
            catch (error) {
                res.status(500).json({ message: error === null || error === void 0 ? void 0 : error.message });
            }
        });
    }
    confirmSlotAvail(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const isSlotsAvail = yield this.userUseCase.confirmSlotAvail(req.body);
                if (isSlotsAvail) {
                    return (0, responseUtil_1.sendResponse)(res, true, "Slots are available", StatusCode_1.StatusCode.SUCCESS);
                }
                else {
                    return (0, responseUtil_1.sendResponse)(res, false, "One or more slots are unavailable", StatusCode_1.StatusCode.BAD_REQUEST);
                }
            }
            catch (error) {
                (0, responseUtil_1.sendResponse)(res, false, error.message, StatusCode_1.StatusCode.INTERNAL_SERVER_ERROR);
            }
        });
    }
    saveBooking(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // console.log("Save Bookiing is Aprochec*)");
                // console.log("bookingDets in Controller : ", req.body);
                const isBooked = yield this.userUseCase.bookTheSlots(req.body);
                // console.log("Sending BOOKeD Dets ;", isBooked);
                if (isBooked.success) {
                    res.status(200).json({ success: true, isBooked, message: "Turf Slots was Booked successfully :" });
                }
                else {
                    res.status(500).json({ success: false, message: "Something went wrong while booking the slots !! :" });
                }
            }
            catch (error) {
                console.log("THRowing Error from SaveBooking :", error);
                res.status(500).json({ message: error === null || error === void 0 ? void 0 : error.message });
            }
        });
    }
    getBookings(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { userId, page, limit } = req.query;
                const bookings = yield this.userUseCase.getBookingOfUser(userId, page, limit);
                // res.status(200).json({ success: true, bookings, message: "Bookings Fetched successfully :" });
                (0, responseUtil_1.sendResponse)(res, true, "Bookings Fetched successfully :", StatusCode_1.StatusCode.SUCCESS, { bookings });
            }
            catch (error) {
                (0, responseUtil_1.sendResponse)(res, false, error.message, StatusCode_1.StatusCode.INTERNAL_SERVER_ERROR);
                // res.status(500).json({ message: error?.message });
            }
        });
    }
    myWallet(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { userId } = req.params;
                const wallet = yield this.userUseCase.getWalletbyId(userId);
                // console.log("This is the Mywallet C : userId ", userId);
                (0, responseUtil_1.sendResponse)(res, true, "Wallet Fetched successfully !", StatusCode_1.StatusCode.SUCCESS, { wallet });
            }
            catch (error) {
                (0, responseUtil_1.sendResponse)(res, false, error.message, StatusCode_1.StatusCode.INTERNAL_SERVER_ERROR);
            }
        });
    }
    cancelSlot(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { userId, slotId, bookingId } = req.params;
                const isCancelled = yield this.userUseCase.cancelTheSlot(userId, slotId, bookingId);
                if (isCancelled.success) {
                    res.status(200).json({ success: true, booking: isCancelled, message: "Slots has been Cancelled successfully :" });
                }
                else {
                    res.status(500).json({ success: false, message: "Something went wrong while Cancelling the slots !! :" });
                }
            }
            catch (error) {
                res.status(500).json({ message: error === null || error === void 0 ? void 0 : error.message, error });
            }
        });
    }
    checkWalletBalance(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { userId } = req.params;
                const total = Number(req.query.grandTotal);
                const walletBalance = yield this.userUseCase.checkBalance(userId, total);
                (0, responseUtil_1.sendResponse)(res, true, "Balance Checked successfully ..!", StatusCode_1.StatusCode.SUCCESS, { walletBalance });
                // res.status(200).json({ success: true, walletBalance, message: "Balance Checked successfully :" });
            }
            catch (error) {
                (0, responseUtil_1.sendResponse)(res, false, error.message, StatusCode_1.StatusCode.INTERNAL_SERVER_ERROR);
                // res.status(500).json({ message: error?.message, error });
            }
        });
    }
    bookSlotsByWallet(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { userId } = req.params;
                // console.log("Book BY walLet is HEre >");
                // console.log("UserId :", userId);
                // console.log("SEelect Sltosf :", req.body);
                const isBookingCompleted = yield this.userUseCase.bookSlotByWallet(userId, req.body);
                (0, responseUtil_1.sendResponse)(res, true, "Balance Checked successfully ..!", StatusCode_1.StatusCode.SUCCESS, { isBookingCompleted });
                // res.status(200).json({ success: true, isBookingCompleted, message: "Balance Checked successfully :" });
            }
            catch (error) {
                (0, responseUtil_1.sendResponse)(res, false, error.message, StatusCode_1.StatusCode.INTERNAL_SERVER_ERROR);
                // res.status(500).json({ message: error?.message, error });
            }
        });
    }
    createChatRoom(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { userId, companyId } = req.params;
                const chatRoom = yield this.userUseCase.createChatRoom(userId, companyId);
                (0, responseUtil_1.sendResponse)(res, true, "Chat Room has been Created or getting successfully ..!", StatusCode_1.StatusCode.SUCCESS, { room: chatRoom });
            }
            catch (error) {
                (0, responseUtil_1.sendResponse)(res, false, error.message, StatusCode_1.StatusCode.INTERNAL_SERVER_ERROR);
            }
        });
    }
    onSendMessage(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { userId, companyId } = req.params;
                const sendMessage = yield this.userUseCase.sendMessage(userId, companyId, req.body);
                (0, responseUtil_1.sendResponse)(res, true, "Message Sent Successfully", StatusCode_1.StatusCode.SUCCESS, { message: sendMessage });
            }
            catch (error) {
                (0, responseUtil_1.sendResponse)(res, false, error.message, StatusCode_1.StatusCode.INTERNAL_SERVER_ERROR);
            }
        });
    }
    getMessages(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { roomId } = req.params;
                const messages = yield this.userUseCase.getMessages(roomId);
                (0, responseUtil_1.sendResponse)(res, true, "Messages Fetched Successfully ..!", StatusCode_1.StatusCode.SUCCESS, { messages });
            }
            catch (error) {
                (0, responseUtil_1.sendResponse)(res, false, error.message, StatusCode_1.StatusCode.INTERNAL_SERVER_ERROR);
            }
        });
    }
    getChats(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { userId } = req.params;
                const chats = yield this.userUseCase.getChats(userId);
                (0, responseUtil_1.sendResponse)(res, true, "Chats Fetched Successfully ..:)", StatusCode_1.StatusCode.SUCCESS, { chats });
            }
            catch (error) {
                (0, responseUtil_1.sendResponse)(res, false, error.message, StatusCode_1.StatusCode.INTERNAL_SERVER_ERROR);
            }
        });
    }
    messageDeleteForEveryOne(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { messageId } = req.params;
                const updatedMessage = yield this.userUseCase.deleteForEveryOne(messageId);
                (0, responseUtil_1.sendResponse)(res, true, "Notification is Deleted Successfully :!", StatusCode_1.StatusCode.SUCCESS, { message: updatedMessage });
            }
            catch (error) {
                (0, responseUtil_1.sendResponse)(res, false, error.message, StatusCode_1.StatusCode.INTERNAL_SERVER_ERROR);
            }
        });
    }
    messageDeleteForMe(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { messageId } = req.params;
                const updatedMessage = yield this.userUseCase.deleteForMe(messageId);
                (0, responseUtil_1.sendResponse)(res, true, "Notification is Deleted Successfully :!", StatusCode_1.StatusCode.SUCCESS, { message: updatedMessage });
            }
            catch (error) {
                (0, responseUtil_1.sendResponse)(res, false, error.message, StatusCode_1.StatusCode.INTERNAL_SERVER_ERROR);
            }
        });
    }
}
exports.UserController = UserController;
