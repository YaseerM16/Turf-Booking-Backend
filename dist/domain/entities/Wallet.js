"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Wallet = void 0;
class Wallet {
    constructor(_id, userId, walletBalance, walletTransaction) {
        this._id = _id;
        this.userId = userId;
        this.walletBalance = walletBalance;
        this.walletTransaction = walletTransaction;
    }
}
exports.Wallet = Wallet;
