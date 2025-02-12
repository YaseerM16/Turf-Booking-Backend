import express from "express"
import { userRoute } from "./app/routes/userRoutes"
import dotenv from "dotenv"
import mongoose from "mongoose"
import cors from "cors"
import cookieParser from "cookie-parser";
import { companyRoute } from "./app/routes/companyRoutes"
import { adminRoute } from "./app/routes/adminRoutes"
import { notificationRoute } from "./app/routes/notification.Routes"
import morgan from "morgan"

mongoose
userRoute
dotenv.config()


mongoose.connect(process.env.MONGO_URL || "")
    .then(() => console.log("Mongo DB Connected :)"))
    .catch(err => console.log("Error While DB Connection ;", err))
const app = express()
app.use(morgan("dev")) // You can change this format based on your needs
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))
app.use(cookieParser());

app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "http://localhost:5000");
    res.header("Access-Control-Allow-Credentials", "true");
    res.header(
        "Access-Control-Allow-Headers",
        "Origin, X-Requested-With, Content-Type, Accept, Authorization"
    );
    next();
});

app.use(
    cors({
        origin: ['http://localhost:3000', "http://127.0.0.1:3000"],
        credentials: true,
    })
);


app.use("/api/v1/user", userRoute)
app.use("/api/v1/company", companyRoute)
app.use("/api/v1/admin", adminRoute)
app.use("/api/v1/notification", notificationRoute)

export default app


