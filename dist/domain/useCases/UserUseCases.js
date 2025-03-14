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
exports.UserUseCase = void 0;
const errors_1 = require("../../shared/utils/errors");
const PasswordService_1 = require("../../infrastructure/services/PasswordService");
const StatusCode_1 = require("../../shared/enums/StatusCode");
const client_s3_1 = require("@aws-sdk/client-s3");
const s3_request_presigner_1 = require("@aws-sdk/s3-request-presigner");
const multerConfig_1 = require("../../infrastructure/multer/multerConfig");
const config_1 = require("../../config/config");
class UserUseCase {
    constructor(userRepository, mailService) {
        this.userRepository = userRepository;
        this.mailService = mailService;
    }
    googleRegister(email, username) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const existingUser = yield this.userRepository.findByEmail(email);
                if (existingUser)
                    throw new errors_1.ErrorResponse("user aldready registered", 400);
                const newUser = yield this.userRepository.googleRegister(email, username);
                return newUser;
            }
            catch (error) {
                throw new errors_1.ErrorResponse(error.message, error.status);
            }
        });
    }
    googleLogin(email) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const existingUser = yield this.userRepository.findByEmail(email);
                if (!existingUser)
                    throw new errors_1.ErrorResponse("user not found", 400);
                return existingUser;
            }
            catch (error) {
                throw new errors_1.ErrorResponse(error.message, error.status);
            }
        });
    }
    RegisterUser(data) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const existingUser = yield this.userRepository.findByEmail(data.email);
                if (existingUser)
                    throw new errors_1.ErrorResponse("user aldready registered", 400);
                if (data.password) {
                    const hashedPassword = yield (0, PasswordService_1.generateHashPassword)(data.password);
                    data.password = hashedPassword;
                }
                // console.log("Createing NewUser :)");
                const newUser = yield this.userRepository.create(data);
                const plainUser = {
                    id: newUser._id,
                    email: newUser.email,
                    name: newUser.name,
                    role: "user"
                };
                yield this.mailService.accountVerifyMail(plainUser, "verifyEmail");
                return newUser;
            }
            catch (error) {
                console.log("Error is Throwing in UserUseCase :", error);
                throw new errors_1.ErrorResponse(error.message, error.status);
            }
        });
    }
    sendVerificationMail(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const user = yield this.userRepository.findById(userId);
                if (!user)
                    throw new errors_1.ErrorResponse("User not found for creating the Wallet.", 404);
                const plainUser = {
                    id: user._id,
                    email: user.email,
                    name: user.name,
                    role: "user"
                };
                yield this.mailService.accountVerifyMail(plainUser, "verifyEmail");
            }
            catch (error) {
                console.error("Failed to send verification email:", error.message);
            }
        });
    }
    userLogin(email, password) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const user = yield this.userRepository.findByEmail(email);
                if (!user || !user.password) {
                    throw new errors_1.ErrorResponse("user dosen't exist", 400);
                }
                const passwordMatch = yield (0, PasswordService_1.comparePassword)(password, user.password);
                if (!passwordMatch) {
                    throw new errors_1.ErrorResponse("password dosen't match", 401);
                }
                if (!user.isActive) {
                    throw new errors_1.ErrorResponse("Your Account is Blocked..!!", 403);
                }
                return user;
            }
            catch (error) {
                throw new errors_1.ErrorResponse(error.message, error.status);
            }
        });
    }
    verifyMail(type, token, email) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const user = yield this.userRepository.findByEmail(email);
                // console.log("User email in VerifyMail :", user?.email);
                if (type === "verifyEmail" && (user === null || user === void 0 ? void 0 : user.verifyTokenExpiry)) {
                    const date = user.verifyTokenExpiry.getTime();
                    if (date < Date.now()) {
                        throw new errors_1.ErrorResponse("Token expired", 400);
                    }
                    if (user.verifyToken === token) {
                        const data = {
                            isVerified: true,
                            verifyToken: "",
                            verifyTokenExpiry: "",
                        };
                        let updatedUser = yield this.userRepository.update(user._id.toString(), data);
                        return updatedUser;
                    }
                    else {
                        throw new errors_1.ErrorResponse("Invalid verification token", 400);
                    }
                }
                else if (type === "forgotPassword" && (user === null || user === void 0 ? void 0 : user.forgotPasswordTokenExpiry)) {
                    const date = user.forgotPasswordTokenExpiry.getTime();
                    if (date < Date.now()) {
                        throw new errors_1.ErrorResponse("Token expired", 400);
                    }
                    if (user.forgotPasswordToken === token) {
                        const data = {
                            isVerified: true,
                            forgotPasswordToken: "",
                            forgotPasswordTokenExpiry: "",
                        };
                        let updatedUser = yield this.userRepository.update(user._id.toString(), data);
                        return updatedUser;
                    }
                    else {
                        throw new errors_1.ErrorResponse("Invalid password reset token", 400);
                    }
                }
                return user;
            }
            catch (error) {
                throw new errors_1.ErrorResponse(error.message, error.status);
            }
        });
    }
    updateProfileImage(_id, url) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const data = { profilePicture: url };
                const user = yield this.userRepository.update(_id, data);
                if (!user) {
                    throw new errors_1.ErrorResponse("User not found or update failed", 404); // Handling not found
                }
                return user;
            }
            catch (error) {
                throw new errors_1.ErrorResponse(error.message, error.status);
            }
        });
    }
    updateProfileDetails(_id, data) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                console.log("Update Dets for APi : ", data);
                const user = yield this.userRepository.update(_id, data);
                if (!user) {
                    throw new errors_1.ErrorResponse("User not found or update failed", 404); // Handling not found
                }
                return user;
            }
            catch (error) {
                throw new errors_1.ErrorResponse(error.message, error.status);
            }
        });
    }
    forgotPassword(email) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const user = yield this.userRepository.findByEmail(email);
                if (!user) {
                    throw new errors_1.ErrorResponse("User not found", 404);
                }
                yield this.mailService.accountVerifyMail(user, "forgotPassword");
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
                const user = yield this.userRepository.findByEmail(email);
                const updatedUser = yield this.userRepository.update(user === null || user === void 0 ? void 0 : user._id.toString(), {
                    password: hashedPassword,
                });
                return updatedUser;
            }
            catch (error) {
                throw new errors_1.ErrorResponse(error.message, error.status);
            }
        });
    }
    topTurfs() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const topTurfs = yield this.userRepository.topTurfs();
                // console.log("These are the TIp :", topTurfs);
                return topTurfs;
            }
            catch (error) {
                throw new errors_1.ErrorResponse(error.message, StatusCode_1.StatusCode.INTERNAL_SERVER_ERROR);
            }
        });
    }
    getAllTurfs(queryobj) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const page = parseInt(queryobj.page) || 1; // Default to page 1 if not provided
                const limit = parseInt(queryobj.limit) || 0;
                const searchQry = queryobj.searchQry;
                const filter = {
                    type: queryobj.type || "",
                    size: queryobj.size || "",
                    price: queryobj.price || ""
                };
                // console.log("page : ", page);
                // console.log("limit : ", limit);
                // console.log("searchQry : ", searchQry);
                // console.log("filter : ", filter);
                const query = { page, limit, searchQry, filter };
                const turfs = yield this.userRepository.getAllTurfs(query);
                return { turfs: turfs.turfs, totalTurfs: turfs.totalTurfs };
            }
            catch (error) {
                throw new errors_1.ErrorResponse(error.message, error.status);
            }
        });
    }
    getTurfById(turfId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const turf = yield this.userRepository.getTurfById(turfId);
                return turf;
            }
            catch (error) {
                throw new errors_1.ErrorResponse(error.message, error.status);
            }
        });
    }
    getSlotsByDay(turfId, day, date) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const slots = yield this.userRepository.getSlotByDay(turfId, day, date);
                return slots;
            }
            catch (error) {
                throw new errors_1.ErrorResponse(error.message, error.status);
            }
        });
    }
    confirmSlotAvail(slots) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const isSlotsAvail = yield this.userRepository.confirmSlotAvail(slots);
                return isSlotsAvail;
            }
            catch (error) {
                throw new errors_1.ErrorResponse(error.message, StatusCode_1.StatusCode.INTERNAL_SERVER_ERROR);
            }
        });
    }
    bookTheSlots(fullDetails) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { udf1, udf2, udf3, udf4, amount, slots, addedon, status, txnid, mode } = fullDetails;
                const bookingData = {
                    userId: udf1,
                    companyId: udf2,
                    turfId: udf4,
                    selectedSlots: slots,
                    totalAmount: amount,
                    status: "completed",
                    paymentStatus: 'completed',
                    paymentMethod: mode,
                    paymentTransactionId: txnid,
                    paymentDate: null,
                    bookingDate: new Date(),
                    isRefunded: false,
                    isActive: true,
                };
                const isBooked = yield this.userRepository.bookTheSlots(bookingData);
                if (isBooked === null || isBooked === void 0 ? void 0 : isBooked.success) {
                    return isBooked;
                }
                return { success: false, message: "Failed to book the Slots ..!!" };
            }
            catch (error) {
                throw new errors_1.ErrorResponse(error.message, error.status);
            }
        });
    }
    getBookingOfUser(userId, page, limit) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const userBookings = yield this.userRepository.getBookingByUserId(userId, page, limit);
                return userBookings;
            }
            catch (error) {
                throw new errors_1.ErrorResponse(error.message, error.status);
            }
        });
    }
    createWallet(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const wallet = this.userRepository.createWallet(userId);
                if (wallet) {
                    return {
                        success: true,
                        data: wallet,
                        message: "Wallet created successfully.",
                    };
                }
                return {
                    success: false,
                    message: "Failed to create wallet. Please try again.",
                    status: 500,
                };
            }
            catch (error) {
                throw new errors_1.ErrorResponse(error.message, error.status);
            }
        });
    }
    getWalletbyId(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const wallet = yield this.userRepository.getWalletById(userId);
                return wallet;
            }
            catch (error) {
                throw new errors_1.ErrorResponse(error.message, error.status);
            }
        });
    }
    cancelTheSlot(userId, slotId, bookingId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const isCancelled = yield this.userRepository.cancleTheSlot(userId, slotId, bookingId);
                if (isCancelled.success) {
                    return isCancelled;
                }
                return { success: false, message: "Failed to Cancel the Slots ..!!" };
            }
            catch (error) {
                throw new errors_1.ErrorResponse(error.message, error.status);
            }
        });
    }
    checkBalance(userId, total) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!userId || total <= 0) {
                    throw new errors_1.ErrorResponse("Invalid input parameters.", 400);
                }
                const balanceCheckResult = yield this.userRepository.checkWalletBalance(userId, total);
                return balanceCheckResult;
            }
            catch (error) {
                console.error("Error checking balance for user:", userId, error);
                throw new errors_1.ErrorResponse(error.message || "Error checking balance.", error.status || 500);
            }
        });
    }
    bookSlotByWallet(userId, bookingDets) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!userId || !bookingDets) {
                    throw new errors_1.ErrorResponse("Invalid input parameters for booking by wallet :.", 400);
                }
                const isBooked = yield this.userRepository.bookSlotsByWallet(userId, bookingDets);
                return isBooked;
            }
            catch (error) {
                throw new errors_1.ErrorResponse(error.message || "Error checking balance.", error.status || 500);
            }
        });
    }
    createChatRoom(userId, companyId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!userId || !companyId)
                    throw new errors_1.ErrorResponse("UserId or CompanyId were not getting !!", StatusCode_1.StatusCode.BAD_REQUEST);
                const chatRoom = yield this.userRepository.createChatRoom(userId, companyId);
                return chatRoom;
            }
            catch (error) {
                throw new errors_1.ErrorResponse(error.message || "Error checking balance.", StatusCode_1.StatusCode.INTERNAL_SERVER_ERROR);
            }
        });
    }
    sendMessage(userId, companyId, data) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!userId || !companyId || !data)
                    throw new errors_1.ErrorResponse("UserId or CompanyId or data were not getting While try to Send Message !!", StatusCode_1.StatusCode.BAD_REQUEST);
                const message = yield this.userRepository.sendMessage(userId, companyId, data);
                return message;
            }
            catch (error) {
                throw new errors_1.ErrorResponse(error.message || "Error Sending Message to Company !!.", StatusCode_1.StatusCode.INTERNAL_SERVER_ERROR);
            }
        });
    }
    getMessages(roomId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!roomId)
                    throw new errors_1.ErrorResponse("roomId data were not getting While try to Get Messages !!", StatusCode_1.StatusCode.BAD_REQUEST);
                const messages = yield this.userRepository.getMessages(roomId);
                return messages;
            }
            catch (error) {
                throw new errors_1.ErrorResponse(error.message || "Error While Getting the Messages ...!!", StatusCode_1.StatusCode.INTERNAL_SERVER_ERROR);
            }
        });
    }
    getChats(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!userId)
                    throw new errors_1.ErrorResponse("userId is not getting While try to Get Chats.. !!", StatusCode_1.StatusCode.BAD_REQUEST);
                const chats = yield this.userRepository.getChats(userId);
                return chats;
            }
            catch (error) {
                throw new errors_1.ErrorResponse(error.message || "Error While Getting the Messages ...!!", StatusCode_1.StatusCode.INTERNAL_SERVER_ERROR);
            }
        });
    }
    deleteForEveryOne(messageId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!messageId)
                    throw new errors_1.ErrorResponse("message Id is not getting while for delete for Everyone.. !!", StatusCode_1.StatusCode.BAD_REQUEST);
                const updatedMessage = yield this.userRepository.messageDeleteEveryOne(messageId);
                return updatedMessage;
            }
            catch (error) {
                throw new errors_1.ErrorResponse(error.message || "Error While Deleting the Message for everyone ...!!", StatusCode_1.StatusCode.INTERNAL_SERVER_ERROR);
            }
        });
    }
    deleteForMe(messageId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!messageId)
                    throw new errors_1.ErrorResponse("message Id is not getting while for delete for Everyone.. !!", StatusCode_1.StatusCode.BAD_REQUEST);
                const updatedMessage = yield this.userRepository.messageDeleteForMe(messageId);
                return updatedMessage;
            }
            catch (error) {
                throw new errors_1.ErrorResponse(error.message || "Error While Deleting the Message for everyone ...!!", StatusCode_1.StatusCode.INTERNAL_SERVER_ERROR);
            }
        });
    }
    getSignedUrlUseCase(files) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!Array.isArray(files) || files.length === 0) {
                throw new Error("No files provided");
            }
            return yield Promise.all(files.map((file) => __awaiter(this, void 0, void 0, function* () {
                const fileKey = `courses/${Date.now()}-${file.fileName}`;
                const command = new client_s3_1.PutObjectCommand({
                    Bucket: config_1.config.S3_BUCKET_NAME,
                    Key: fileKey,
                    ContentType: file.fileType,
                });
                const presignedUrl = yield (0, s3_request_presigner_1.getSignedUrl)(multerConfig_1.s3, command, { expiresIn: 300 });
                return { fileKey, presignedUrl };
            })));
        });
    }
    ;
}
exports.UserUseCase = UserUseCase;
