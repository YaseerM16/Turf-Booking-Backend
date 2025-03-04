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
exports.MailService = void 0;
const errors_1 = require("../../shared/utils/errors");
const User_1 = require("../../domain/entities/User");
const PasswordService_1 = require("./PasswordService");
const sendMail_1 = require("../../shared/utils/sendMail");
User_1.User;
sendMail_1.sendMail;
class MailService {
    constructor(companyRepository, userRepository) {
        this.companyRepository = companyRepository;
        this.userRepository = userRepository;
    }
    accountVerifyMail(user, type) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // console.log("User in AccountVerifyMail :", user);
                // console.log("Id VAl :", user.id);
                const userIdString = user.id.toString();
                let token = yield (0, PasswordService_1.generateHashPassword)(userIdString);
                const currentDate = new Date();
                const twoDaysLater = new Date(currentDate);
                if (type === "verifyEmail") {
                    twoDaysLater.setDate(currentDate.getDate() + 2);
                    user.verifyToken = token;
                    user.verifyTokenExpiry = twoDaysLater;
                }
                else if (type === "forgotPassword") {
                    // console.log("forgotPassword is attempting :-");
                    twoDaysLater.setDate(currentDate.getDate() + 1);
                    user.forgotPasswordToken = token;
                    user.forgotPasswordTokenExpiry = twoDaysLater;
                }
                // Ensure user is updated before proceeding
                // console.log("User Details before update :", user.forgotPasswordTokenExpiry);
                // const userUpdatePayload = JSON.stringify(user); // Convert the user object to a JSON string
                // const updatedUser = await this.repository.update(user.id, { [userUpdatePayload]: true });
                // // Check if the update was successful and proceed only if the user has updated values
                // if (!updatedUser) {
                //     throw new ErrorResponse("User update failed", 500);
                // }
                if (user.role == "user") {
                    const updateUserToken = yield this.userRepository.update(user.id, user);
                    if (!updateUserToken) {
                        throw new errors_1.ErrorResponse("User update failed", 500);
                    }
                    // console.log("LOgges of user.role user recipient :", user.name, user.email, type, token, user.role);
                    yield (0, sendMail_1.sendMail)(user.name, user.email, type, token, user.role);
                }
                else if (user.role == "company") {
                    const updateCompanyToken = yield this.companyRepository.update(user.id, user);
                    if (!updateCompanyToken) {
                        throw new errors_1.ErrorResponse("User update failed", 500);
                    }
                    // console.log("LOgges of user.role company recipient :", user.companyname, user.companyemail, type, token, user.role);
                    yield (0, sendMail_1.sendMail)(user.companyname, user.companyemail, type, token, user.role);
                }
                // const recipientName = user?.name ? user.name : user.companyname;
                // const recipientEmail = user?.email ? user.email : user.companyemail;
                // await sendMail(recipientObj["recipientName"], recipientObj["recipientEmail"], type, token, recipientObj["recipientRole"]);
                // Ensure the updated user object has the correct email and name for sending the email
                // if (user instanceof User) {
                //     console.log("mail details to send -:", "name :", user.name, "email :", user.email);
                //     await sendMail(user.name, user.email, type, token, "user");
                // } else {
                //     console.log("mail details to send -:", "company name :", user.companyname, "email :", user.companyemail);
                //     await sendMail(user.companyname, user.companyemail, type, token, "company");
                // }
            }
            catch (error) {
                console.log("Error inside the MailService :", error);
                throw new errors_1.ErrorResponse(error.message, error.status);
            }
        });
    }
}
exports.MailService = MailService;
