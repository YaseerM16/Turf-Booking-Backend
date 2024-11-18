import dotenv from "dotenv";
dotenv.config();

export const config = {
    PORT: process.env.PORT || 3000,
    MONGO_URI: process.env.MONGO_URI,
    JWT_SECRET: process.env.JWT_SECRET,
    NODEMAILER_USER: process.env.NODEMAILER_USER,
    NODEMAILER_PASSWORD: process.env.NODEMAILER_PASSWORD,
    EMAIL: process.env.EMAIL,
    PASSWORD: process.env.PASSWORD,
    MAIL_LINK: process.env.MAIL_LINK,
    CLIENT_ORIGIN: process.env.CLIENT_ORIGIN,
    STRIPE_API_KEY: process.env.STRIPE_API_KEY,
    MODE: process.env.MODE,
};