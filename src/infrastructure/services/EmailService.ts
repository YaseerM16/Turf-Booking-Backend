import { ErrorResponse } from "../../shared/utils/errors";
import { User } from "../../domain/entities/User";
import { IUserRepository } from "../../domain/repositories/IUserRepository";
import { generateHashPassword } from "./PasswordService";
import { sendMail } from "../../shared/utils/sendMail";
import { IEmailService } from "../../app/interfaces/services/IEmailService";
import { Company } from "../../domain/entities/Company";
import { ICompanyRepository } from "../../domain/repositories/ICompanyRepository";

User
sendMail
interface Recipient {
    [key: string]: string;  // Dynamic keys with string values
}
export class MailService implements IEmailService {
    constructor(private companyRepository: ICompanyRepository, private userRepository: IUserRepository) { }

    async accountVerifyMail(user: any, type: string): Promise<void> {
        try {
            // console.log("User in AccountVerifyMail :", user);
            // console.log("Id VAl :", user.id);
            const userIdString = user.id.toString()

            let token = await generateHashPassword(userIdString);
            const currentDate = new Date();
            const twoDaysLater = new Date(currentDate);

            if (type === "verifyEmail") {
                twoDaysLater.setDate(currentDate.getDate() + 2);
                user.verifyToken = token;
                user.verifyTokenExpiry = twoDaysLater;
            } else if (type === "forgotPassword") {
                // console.log("forgotPassword is attempting :-");

                twoDaysLater.setDate(currentDate.getDate() + 1);
                user.forgotPasswordToken = token;
                user.forgotPasswordTokenExpiry = twoDaysLater;
            }

            // Ensure user is updated before proceeding
            // console.log("User Details before update :", user.forgotPasswordTokenExpiry);
            // const userUpdatePayload = JSON.stringify(user); // Convert the user object to a JSON string

            // const updatedUser = await this.repository.update(user.id, { [userUpdatePayload]: true });

            // // Check if the update was successful and proceed only if the user has updated values
            // if (!updatedUser) {
            //     throw new ErrorResponse("User update failed", 500);
            // }

            if (user.role == "user") {

                const updateUserToken = await this.userRepository.update(user.id, user)
                if (!updateUserToken) {
                    throw new ErrorResponse("User update failed", 500);
                }

                // console.log("LOgges of user.role user recipient :", user.name, user.email, type, token, user.role);

                await sendMail(user.name, user.email, type, token, user.role);

            } else if (user.role == "company") {
                const updateCompanyToken = await this.companyRepository.update(user.id, user)
                if (!updateCompanyToken) {
                    throw new ErrorResponse("User update failed", 500);
                }
                // console.log("LOgges of user.role company recipient :", user.companyname, user.companyemail, type, token, user.role);

                await sendMail(user.companyname, user.companyemail, type, token, user.role);
            }

            // const recipientName = user?.name ? user.name : user.companyname;
            // const recipientEmail = user?.email ? user.email : user.companyemail;

            // await sendMail(recipientObj["recipientName"], recipientObj["recipientEmail"], type, token, recipientObj["recipientRole"]);

            // Ensure the updated user object has the correct email and name for sending the email
            // if (user instanceof User) {
            //     console.log("mail details to send -:", "name :", user.name, "email :", user.email);

            //     await sendMail(user.name, user.email, type, token, "user");
            // } else {
            //     console.log("mail details to send -:", "company name :", user.companyname, "email :", user.companyemail);

            //     await sendMail(user.companyname, user.companyemail, type, token, "company");
            // }

        } catch (error: any) {
            console.log("Error inside the MailService :", error);

            throw new ErrorResponse(error.message, error.status);
        }
    }

}
