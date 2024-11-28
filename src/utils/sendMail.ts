import { config } from "../config/config";
import { ErrorResponse } from "./errors";
import nodemailer from "nodemailer"

config

export const sendMail = async (
    name: string,
    email: string,
    type: string,
    token: string,
    role: string
) => {
    try {
        console.log("mail sending...");

        const routing = role === "user" ? "/verifymail" : "/company/verifymail";
        let transporter;
        if (config.MODE === "production") {
            transporter = nodemailer.createTransport({
                host: "smtp.gmail.com",
                port: 587,
                secure: false,
                auth: {
                    user: config.EMAIL,
                    pass: config.PASSWORD,
                },
            });
        } else {
            transporter = nodemailer.createTransport({
                host: "sandbox.smtp.mailtrap.io",
                port: 2525,
                auth: {
                    user: config.NODEMAILER_USER,
                    pass: config.NODEMAILER_PASSWORD,
                },
            });
        }
        const info = await transporter.sendMail({
            from: '"Turf Booking "<turfbooking@gmail.com>',
            to: `${email}`,
            subject:
                type === "verifyEmail" ? "Account verification" : "Reset Password",
            html: `<h2>Hi ${name}</h2><br/>
      <p>Click this <a href="${config.MAIL_LINK
                }${routing}?type=${type}&token=${token}&email=${email}"> link </a>to ${type === "verifyEmail" ? "verify your account " : "reset password"
                } 
      
      </p><h4> </h4>`,
        });
        return info;
    } catch (error: any) {
        throw new ErrorResponse(error.message, error.status);
    }
};