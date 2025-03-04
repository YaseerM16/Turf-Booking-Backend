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
const node_cron_1 = __importDefault(require("node-cron"));
const Subscription_1 = require("../database/models/Subscription");
node_cron_1.default.schedule('0 0 * * *', () => __awaiter(void 0, void 0, void 0, function* () {
    console.log('Checking for expired subscriptions...');
    try {
        const currentDate = new Date();
        const expiredSubscriptions = yield Subscription_1.Subscription.find({
            endDate: { $lt: currentDate },
            status: 'active',
        });
        if (expiredSubscriptions.length > 0) {
            for (const subscription of expiredSubscriptions) {
                yield Subscription_1.Subscription.deleteOne({ _id: subscription._id });
                console.log(`Subscription with ID ${subscription._id} has expired and been deleted.`);
            }
        }
        else {
            console.log('No expired subscriptions found.');
        }
    }
    catch (error) {
        console.error('Error while checking for expired subscriptions:', error);
    }
}));
