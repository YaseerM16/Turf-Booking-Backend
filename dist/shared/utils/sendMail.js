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
exports.sendMail = void 0;
const config_1 = require("../../config/config");
const errors_1 = require("./errors");
const nodemailer_1 = __importDefault(require("nodemailer"));
const sendMail = (name, email, type, token, role) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log("mail sending...");
        const routing = role === "user" ? "/verifymail" : "/company/verifymail";
        let transporter;
        if (config_1.config.MODE === "production") {
            transporter = nodemailer_1.default.createTransport({
                host: "smtp.gmail.com",
                port: 587,
                secure: false,
                auth: {
                    user: config_1.config.EMAIL,
                    pass: config_1.config.PASSWORD,
                },
            });
        }
        else {
            transporter = nodemailer_1.default.createTransport({
                host: "smtp.ethereal.email",
                port: 587,
                auth: {
                    user: config_1.config.NODEMAILER_USER,
                    pass: config_1.config.NODEMAILER_PASSWORD,
                },
            });
        }
        const info = yield transporter.sendMail({
            from: '"Turf Booking "<turfbooking@gmail.com>',
            to: `${email}`,
            subject: type === "verifyEmail" ? "Account verification" : "Reset Password",
            html: `<h2>Hi ${name}</h2><br/>
      <p>Click this <a href="${config_1.config.MAIL_LINK}${routing}?type=${type}&token=${token}&email=${email}"> link </a>to ${type === "verifyEmail" ? "verify your account " : "reset password"} 
      
      </p><h4> </h4>`,
        });
        return info;
    }
    catch (error) {
        throw new errors_1.ErrorResponse(error.message, error.status);
    }
});
exports.sendMail = sendMail;
