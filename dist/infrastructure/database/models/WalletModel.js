"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const WalletSchema = new mongoose_1.Schema({
    userId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true },
    walletBalance: {
        type: Number,
        required: true,
        default: 0
    },
    walletTransaction: [
        {
            transactionDate: { type: Date, default: new Date() },
            transactionAmount: { type: Number, required: true },
            transactionType: { type: String, required: true }, // e.g., 'credit' or 'debit'
            transactionMethod: { type: String, required: true }, // e.g., 'card', 'bank transfer'
        },
    ],
});
exports.default = (0, mongoose_1.model)("Wallet", WalletSchema);
