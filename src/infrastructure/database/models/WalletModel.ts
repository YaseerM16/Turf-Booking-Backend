import mongoose, { model, Schema } from "mongoose"
import { Wallet } from "../../../domain/entities/Wallet"

const WalletSchema = new Schema<Wallet>({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
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
})

export default model("Wallet", WalletSchema);
