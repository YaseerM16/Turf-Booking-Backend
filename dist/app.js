"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const userRoutes_1 = require("./app/routes/userRoutes");
const dotenv_1 = __importDefault(require("dotenv"));
const mongoose_1 = __importDefault(require("mongoose"));
const cors_1 = __importDefault(require("cors"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const companyRoutes_1 = require("./app/routes/companyRoutes");
const adminRoutes_1 = require("./app/routes/adminRoutes");
const notification_Routes_1 = require("./app/routes/notification.Routes");
const morgan_1 = __importDefault(require("morgan"));
const logger_1 = __importDefault(require("./shared/utils/logger"));
mongoose_1.default;
userRoutes_1.userRoute;
dotenv_1.default.config();
mongoose_1.default.connect(process.env.MONGO_URL || "")
    .then(() => console.log("Mongo DB Connected :)"))
    .catch(err => console.log("Error While DB Connection ;", err));
const app = (0, express_1.default)();
app.use((0, morgan_1.default)("dev")); // You can change this format based on your needs
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
app.use((0, cookie_parser_1.default)());
const allowedOrigins = [
    "http://localhost:3000",
    "http://localhost:5000",
    "https://www.turfbooking.online",
    "https://api.turfbooking.online",
];
const corsOptions = {
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        }
        else {
            console.error(`Blocked by CORS: ${origin}`);
            callback(new Error("Not allowed by CORS"));
        }
    },
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE'],
    credentials: true
};
app.use((0, cors_1.default)(corsOptions));
app.use(logger_1.default);
app.use("/api/v1/user", userRoutes_1.userRoute);
app.use("/api/v1/company", companyRoutes_1.companyRoute);
app.use("/api/v1/admin", adminRoutes_1.adminRoute);
app.use("/api/v1/notification", notification_Routes_1.notificationRoute);
exports.default = app;
