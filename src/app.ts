import express from "express"
import { userRoute } from "./app/routes/userRoutes"
import dotenv from "dotenv"
import mongoose from "mongoose"
import cors from "cors"
mongoose
userRoute
dotenv.config()

mongoose.connect(process.env.MONGO_URL || "")
    .then(() => console.log("Mongo DB Connected :)"))
    .catch(err => console.log("Error While DB Connection ;", err))
const app = express()

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
        origin: ['http://localhost:3000', 'http://localhost:5000', "http://127.0.0.1:3000"],
        credentials: true,
    })
);
app.use(express.json())
app.use("/api/v1/user", userRoute)


export default app


