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
exports.generatePaymentHash = generatePaymentHash;
const jssha_1 = __importDefault(require("jssha"));
const config_1 = require("../../config/config");
function generatePaymentHash(_a) {
    return __awaiter(this, arguments, void 0, function* ({ txnid, amount, productinfo, username, email, udf1, udf2, udf3, udf4, udf5, udf6, udf7 }) {
        try {
            // console.log("MErchndt Kay :", config.PAYU_MERCHANT_KEY)
            // console.log("Salt :", config.PAYU_SALT);
            const hashString = `${config_1.config.PAYU_MERCHANT_KEY}|${txnid}|${amount}|${productinfo}|${username}|${email}|${udf1}|${udf2}|${udf3}|${udf4}|${udf5}|${udf6}|${udf7}||||${process.env.PAYU_SALT}`;
            // console.log("Hash String:", hashString);
            const sha = new jssha_1.default("SHA-512", "TEXT");
            sha.update(hashString);
            const hash = sha.getHash("HEX");
            // console.log("Generated Hash:", hash);
            const bookingData = {
                txnid,
                amount,
                productinfo,
                username,
                email,
                udf1,
                udf2,
                udf3,
                udf4,
                udf5,
                udf6,
                udf7,
                paymentStatus: "pending",
                paymentHash: hash,
            };
            // console.log(udf7, 'end');
            // console.log(udf4, 'start');
            // await this.userRepository.saveBooking(bookingData);
            return hash;
        }
        catch (error) {
            throw new Error(error);
        }
    });
}
