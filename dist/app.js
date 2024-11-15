"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const userRoutes_1 = require("./app/routes/userRoutes");
const dotenv_1 = __importDefault(require("dotenv"));
const mongoose_1 = __importDefault(require("mongoose"));
mongoose_1.default;
userRoutes_1.userRoute;
dotenv_1.default.config();
mongoose_1.default.connect(process.env.MONGO_URL || "")
    .then(() => console.log("Mongo DB Connected :)"))
    .catch(err => console.log("Error While DB Connection ;", err));
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use("/api/user", userRoutes_1.userRoute);
exports.default = app;
