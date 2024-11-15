import express from "express"
import { userRoute } from "./app/routes/userRoutes"
import dotenv from "dotenv"
import mongoose from "mongoose"
mongoose
userRoute
dotenv.config()
mongoose.connect(process.env.MONGO_URL || "")
    .then(() => console.log("Mongo DB Connected :)"))
    .catch(err => console.log("Error While DB Connection ;", err))
const app = express()
app.use(express.json())
app.use("/api/user", userRoute)


export default app