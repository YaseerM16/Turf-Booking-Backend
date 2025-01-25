import { Company } from "../entities/Company";
import { ICompanyUseCase } from "../../../src/app/interfaces/usecases/company/ICompanyUseCase"
import { ICompanyRepository } from "../repositories/ICompanyRepository";
import { IEmailService } from "../repositories/IEmailService";
import { ErrorResponse } from "../../shared/utils/errors";
import { comparePassword, generateHashPassword } from "../../infrastructure/services/PasswordService";
import { Turf } from "../entities/Turf";
import { Slot } from "../entities/Slot";
import { ChatRoom as ChatRoomEntity } from "../entities/ChatRoom";
import { StatusCode } from "../../shared/enums/StatusCode";
import { Message } from "../entities/Message";



export class CompanyUseCase implements ICompanyUseCase {

    constructor(private companyRepository: ICompanyRepository, private mailService: IEmailService) { }

    async RegisterCompany(company: Company): Promise<Company> {
        try {
            const existingCompany = await this.companyRepository.findByEmail(company.companyemail)

            if (existingCompany) throw new ErrorResponse("user aldready registered", 400);

            if (company.password) {
                const hashedPassword = await generateHashPassword(company.password);
                company.password = hashedPassword;
            }
            const newCompany = await this.companyRepository.create(company);

            if (!newCompany.googleId) {
                await this.mailService.accountVerifyMail(newCompany, "verifyEmail");
            }

            return newCompany
        } catch (error: any) {
            throw new ErrorResponse(error.message, error.status);
        }
    }

    async verifyMail(type: string, token: string, email: string): Promise<Company | null> {
        try {
            const company = await this.companyRepository.findByEmail(email);

            if (type === "verifyEmail" && company?.verifyTokenExpiry) {
                const date = company.verifyTokenExpiry.getTime();

                if (date < Date.now()) {
                    throw new ErrorResponse("Token expired", 400);
                }

                if (company.verifyToken === token) {
                    const data = {
                        isVerified: true,
                        verifyToken: "",
                        verifyTokenExpiry: "",
                    };

                    let updatedCompany = await this.companyRepository.update(
                        company._id.toString(),
                        data
                    );

                    return updatedCompany;
                } else {
                    throw new ErrorResponse("Invalid verification token", 400);
                }
            } else if (type === "forgotPassword" && company?.forgotPasswordTokenExpiry) {
                const date = company.forgotPasswordTokenExpiry.getTime();

                if (date < Date.now()) {
                    throw new ErrorResponse("Token expired", 400);
                }

                if (company.forgotPasswordToken === token) {
                    const data = {
                        isVerified: true,
                        forgotPasswordToken: "",
                        verifyTokenExforgotPasswordTokenExpirypiry: "",
                    };

                    let updatedCompany = await this.companyRepository.update(
                        company._id.toString(),
                        data
                    );
                    return updatedCompany;
                } else {
                    throw new ErrorResponse("Invalid password reset token", 400);
                }
            }
            return company;
        } catch (error: any) {
            throw new ErrorResponse(error.message, error.status);
        }
    }

    async companyLogin(email: string, password: string): Promise<Company | null> {
        try {
            let company = await this.companyRepository.findByEmail(email);

            if (!company || !company.password) {
                throw new ErrorResponse("Company doesn't exist try Register company..!", 404);
            }
            const passwordMatch = await comparePassword(password, company.password);

            if (!passwordMatch) {
                throw new ErrorResponse("password dosen't match", 400);
            }

            if (!company.isActive) {
                throw new ErrorResponse("Your Company Account is Blocked...!", 404);
            }

            return company;
        } catch (error: any) {
            throw new ErrorResponse(error.message, error.status);
        }
    }

    async updateProfileImage(companyId: string, imageUrl: string): Promise<Company | null> {
        try {
            const data = { profilePicture: imageUrl };
            const company = await this.companyRepository.update(companyId, data);
            if (!company) {
                throw new ErrorResponse("Company not found or update failed", 404);  // Handling not found
            }
            return company;
        } catch (error) {

        }
        throw new Error("Method not implemented.");
    }

    async updateProfileDetails(companyId: string, data: string): Promise<Company | null> {
        try {
            const company = await this.companyRepository.update(companyId, data);
            if (!company) {
                throw new ErrorResponse("User not found or update failed", 404);  // Handling not found
            }
            return company;
        } catch (error: any) {
            throw new ErrorResponse(error.message, error.status);
        }
    }


    ///   <-   Turf    ->   ///

    async registerTurf(turfDetails: any): Promise<Turf | null> {
        try {
            const workingDaysArr = JSON.parse(turfDetails?.workingDays)

            // Parse and transform workingDays to match the new schema
            const price = Number(turfDetails?.price);
            const workingDays = JSON.parse(turfDetails?.workingDays).map((day: string) => ({
                day,
                fromTime: turfDetails.fromTime, // Assign specific fromTime
                toTime: turfDetails.toTime,   // Assign specific toTime
                price             // Include the array of days
            }));

            const workingSlots = {
                fromTime: turfDetails.fromTime, // Add parent-level fromTime
                toTime: turfDetails.toTime,   // Add parent-level toTime
                workingDays,
            };

            const images = turfDetails?.images;
            const location = JSON.parse(turfDetails?.location);
            const facilities = JSON.parse(turfDetails?.selectedFacilities);
            const supportedGames = JSON.parse(turfDetails?.games);

            const turf: Turf = {
                companyId: turfDetails.companyId,
                turfName: turfDetails.turfName,
                address: turfDetails.address,
                description: turfDetails.description,
                turfSize: turfDetails.turfSize,
                turfType: turfDetails.turfType,
                price,
                images,
                facilities,
                supportedGames,
                location,
                workingSlots,
            };

            const isRegistered = await this.companyRepository.registerTurf(turf, workingDaysArr);
            return isRegistered;
        } catch (error: any) {
            throw new ErrorResponse(error.message, error.status);
        }
    }



    async editTurf(turfDetails: any): Promise<Turf | null> {
        try {
            const facilities = JSON.parse(turfDetails?.selectedFacilities)
            const price = Number(turfDetails?.price)
            const supportedGames = JSON.parse(turfDetails?.games)
            const turfId = JSON.parse(turfDetails.turfId)


            const images = turfDetails?.images && turfDetails.images.length > 0
                ? turfDetails.images
                : undefined;

            const turf: any = {
                companyId: turfDetails.companyId,
                turfName: turfDetails.turfName,
                description: turfDetails.description,
                turfSize: turfDetails.turfSize,
                turfType: turfDetails.turfType,
                price,
                ...(images && { images }),
                facilities,
                supportedGames,
            }
            const isUpdated = await this.companyRepository.editTurfById(turfId, turf)
            return isUpdated
        } catch (error: any) {
            throw new ErrorResponse(error.message, error.status);
        }
    }

    async getTurfs(companyId: string): Promise<Turf[] | null> {
        try {

            if (!companyId) throw new ErrorResponse("CompanyId is not Provided :", 500);
            const turfs = await this.companyRepository.getTurfs(companyId)
            return turfs
        } catch (error: any) {
            throw new ErrorResponse(error.message, error.status);
        }
    }

    async blockTurf(turfId: string): Promise<object> {
        try {
            if (!turfId) throw new ErrorResponse("turfId is not Provided :", 500);
            const isBlocked: any = await this.companyRepository.blockTurf(turfId)
            if (isBlocked.success) {
                return isBlocked
            }

            return { success: false }
        } catch (error: any) {
            throw new ErrorResponse(error.message, error.status);
        }
    }

    async unBlockTurf(turfId: string): Promise<object> {
        try {
            if (!turfId) throw new ErrorResponse("turfId is not Provided :", 500);
            const isBlocked: any = await this.companyRepository.unBlockTurf(turfId)
            if (isBlocked.success) {
                return isBlocked
            }

            return { success: false }
        } catch (error: any) {
            throw new ErrorResponse(error.message, error.status);
        }
    }

    async getTurfById(turfId: string): Promise<Turf | null> {
        try {
            if (!turfId) throw new ErrorResponse("TurfId is not Provided :", 500);

            const turfObject = await this.companyRepository.getTurfById(turfId)

            return turfObject as unknown as Turf

        } catch (error: any) {
            throw new ErrorResponse(error.message, error.status);
        }
    }

    async deleteTurfImage(turfId: string, index: number): Promise<String[] | null> {
        try {

            if (!turfId || index === undefined || index === null) throw new ErrorResponse("TurfId or Index is not Provided :", 500);

            const resultantArr = await this.companyRepository.deleteTurfImage(turfId, index)

            return resultantArr

        } catch (error: any) {
            throw new ErrorResponse(error.message, error.status);
        }
    }



    ///   <-  Slot  ->   ///

    async getSlotsByDay(turfId: string, day: string, date: string): Promise<Slot[] | null> {
        try {
            const slots = await this.companyRepository.getSlotByDay(turfId, day, date)
            return slots
        } catch (error: any) {
            throw new ErrorResponse(error.message, error.status);
        }
    }

    async makeSlotUnavail(slotId: string, turfId: string): Promise<object> {
        try {
            if (!turfId || !slotId) throw new ErrorResponse("TurfId or SlotId is not Provided :", 500);

            const isUnavailed: any = await this.companyRepository.makeSlotUnavail(slotId, turfId)
            if (isUnavailed.success) {
                return isUnavailed
            }

            return { success: false }

        } catch (error: any) {
            throw new ErrorResponse(error.message, error.status);
        }
    }

    async makeSlotAvail(slotId: string, turfId: string): Promise<object> {
        try {
            if (!turfId || !slotId) throw new ErrorResponse("TurfId or SlotId is not Provided :", 500);
            const isAvailed: any = await this.companyRepository.makeSlotAvail(slotId, turfId)
            if (isAvailed.success) {
                return isAvailed
            }
            return { success: false }
        } catch (error: any) {
            throw new ErrorResponse(error.message, error.status);
        }
    }

    async addWorkingDays(turfId: string, payload: any): Promise<object> {
        try {
            const { workingDays, fromTime, toTime, price } = payload;

            if (!workingDays || !fromTime || !toTime || !turfId || !price) {
                throw new ErrorResponse("Payload data for adding days is missing  :", 500);
            }

            const isDaysAdded: any = await this.companyRepository.addWorkingDays(turfId, payload)

            if (isDaysAdded?.success) {
                return isDaysAdded
            }

            throw new ErrorResponse("Something Went Wrong While Updating Add Working Days  :", 500);

        } catch (error: any) {
            throw new ErrorResponse(error.message, error.status);
        }
    }

    async getDayDetails(turfId: string, day: string): Promise<object> {
        try {
            if (!turfId || !day) {
                throw new ErrorResponse("TurfId or the Day is not Getting  :", 500);
            }
            const dayDetails: any = await this.companyRepository.getDayDetails(turfId, day)
            if (!dayDetails) {
                throw new ErrorResponse("TurfId or the Day is not Getting  :", 500);
            }

            return dayDetails

        } catch (error: any) {
            throw new ErrorResponse(error.message, error.status);
        }
    }

    async editDayDetails(turfId: string, updates: object): Promise<object> {
        try {

            if (!turfId || !updates) {
                throw new ErrorResponse("TurfId or the Updates Object is not Getting  :", 500);
            }

            const isUpdated = await this.companyRepository.editDayDetails(turfId, updates)

            return isUpdated

        } catch (error: any) {
            throw new ErrorResponse(error.message, error.status);
        }
    }

    async createChatRoom(companyId: string, userId: string): Promise<ChatRoomEntity> {
        try {
            if (!companyId || !userId) throw new ErrorResponse("CompanyId or UserId is not Getting while Creating chat Room ..!:", StatusCode.INTERNAL_SERVER_ERROR);
            const room = await this.companyRepository.createChatRoom(companyId, userId)
            return room
        } catch (error: any) {
            throw new ErrorResponse(error.message, error.status);

        }
    }

    async getChatLists(companyId: string): Promise<ChatRoomEntity[] | null> {
        try {
            if (!companyId) throw new ErrorResponse("CompanyId is not Getting while Getting chat Rooms ..!:", StatusCode.INTERNAL_SERVER_ERROR);
            const chatRooms = await this.companyRepository.getChatRooms(companyId)
            return chatRooms
        } catch (error: any) {
            throw new ErrorResponse(error.message, error.status);
        }
    }

    async getChatMessages(roomId: string): Promise<{ messages: Message[], chat: ChatRoomEntity } | null> {
        try {
            if (!roomId) throw new ErrorResponse("roomID is not Getting while Getting Room Chats ..!:", StatusCode.INTERNAL_SERVER_ERROR);
            const messages = await this.companyRepository.getChatMessages(roomId)
            return messages
        } catch (error: any) {
            throw new ErrorResponse(error.message, error.status);
        }
    }

    async onSendMessage(companyId: string, userId: string, data: object): Promise<Message> {
        try {
            if (!companyId || !userId || !data) throw new ErrorResponse("CompanyId or UserId or data is not Getting while Try to Send Message ..!:", StatusCode.INTERNAL_SERVER_ERROR);
            const message = await this.companyRepository.onSendMessage(companyId, userId, data)
            return message
        } catch (error: any) {
            throw new ErrorResponse(error.message, error.status);
        }
    }


}