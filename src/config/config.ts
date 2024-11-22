import dotenv from "dotenv";
dotenv.config();

export const config = {
    PORT: process.env.PORT || 3000,
    MONGO_URI: process.env.MONGO_URI,
    JWT_SECRET: process.env.JWT_SECRET,
    JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET,
    NODEMAILER_USER: process.env.NODEMAILER_USER,
    NODEMAILER_PASSWORD: process.env.NODEMAILER_PASSWORD,
    EMAIL: process.env.EMAIL,
    PASSWORD: process.env.PASSWORD,
    MAIL_LINK: process.env.FRONT_END,
    CLIENT_ORIGIN: process.env.CLIENT_ORIGIN,
    STRIPE_API_KEY: process.env.STRIPE_API_KEY,
    MODE: process.env.MODE,
    S3_ACCESS_KEY: process.env.S3_ACCESS_KEY,
    S3_SECRET_KEY: process.env.S3_SECRET_KEY,
    S3_BUCKET_NAME: process.env.S3_BUCKET_NAME,
    S3_REGION: process.env.S3_REGION
};
