import { Payment } from "../../../domain/entities/Payment";
import { Slot } from "../../../domain/entities/Slot";
import { Turf } from "../../../domain/entities/Turf";
import { User } from "../../../domain/entities/User";
import { IUserRepository } from "../../../domain/repositories/IUserRepository";
import { ErrorResponse } from "../../../utils/errors";
import { SlotModel } from "../../services/TurfService";
import BookingModel from "../models/BookingModel";
import PaymentModel from "../models/PaymentModel";
import TurfModel from "../models/TurfModel";
import UserModel from "../models/UserModel";


export class MongoUserRepository implements IUserRepository {
    async googleRegister(email: string, username: string): Promise<User | null> {
        try {
            const user = {
                name: username,
                email: email,
            }
            return this.create(user as User)
        } catch (error: any) {
            throw new ErrorResponse(error.message, error.status);
        }
    }

    async findByEmail(email: string): Promise<User | null> {
        try {
            const userDoc = await UserModel.findOne({ email })
            return userDoc ? userDoc : null
        } catch (error: any) {
            throw new ErrorResponse(error.message, error.status);
        }
    }
    async create(user: User): Promise<User> {
        try {
            const userDoc = new UserModel(user)
            await userDoc.save()
            return userDoc

        } catch (error: any) {
            throw new ErrorResponse(error.message, error.status);
        }
    }
    async update(id: string, value: any): Promise<User | null> {
        try {
            const updatedUser = await UserModel.findByIdAndUpdate(id, value, {
                new: true,
                fields: "-password"
            });
            return updatedUser
        } catch (error: any) {
            throw new ErrorResponse(error.message, error.status);
        }
    }

    async getAllTurfs(queryObj: any): Promise<{ turfs: Turf[]; totalTurfs: number }> {
        try {
            // console.log("QUERYObj in UserRepo : ", queryObj);

            const { page, limit, searchQry, filter } = queryObj;

            // Base query
            const query: any = {
                isDelete: false,
                isBlocked: false,
            };


            // Search query
            if (searchQry) {
                query.turfName = { $regex: searchQry, $options: "i" }; // Case-insensitive search
            }

            // Apply type filter
            if (filter?.type) {
                query.turfType = { $in: filter.type.split(",") };
            }

            // Apply size filter
            if (filter?.size) {
                query.turfSize = { $in: filter.size.split(",") };
            }

            // Apply price filter
            if (filter?.price) {
                const priceRanges = filter.price.split(",").map((range: string) => {
                    const [min, max] = range.split("-").map(Number);
                    return { price: { $gte: min, $lte: max } };
                });

                // Combine price ranges with $or
                query.$or = priceRanges;
            }

            // console.log("MongoDB Query:", JSON.stringify(query, null, 2));

            // Pagination options
            const options = {
                skip: (page - 1) * limit,
                limit: parseInt(limit, 10),
            };
            const totalTurfs = await TurfModel.countDocuments(query);

            const turfs = await TurfModel.find(query)
                .skip(options.skip)
                .limit(options.limit);

            return { turfs: turfs as unknown as Turf[], totalTurfs };
        } catch (error: any) {
            throw new ErrorResponse(error.message, error.status);
        }
    }



    async getTurfById(turfId: string): Promise<Turf | null> {
        try {
            const turfs = await TurfModel.findById(turfId)
            return turfs as unknown as Turf
        } catch (error: any) {
            throw new ErrorResponse(error.message, error.status);
        }
    }

    async getSlotByDay(turfId: string, day: string, date: string): Promise<Slot[] | null> {
        try {
            // console.log("HIII Hello :");

            // console.log("turf id : ", turfId);
            // console.log("day : ", day);
            // console.log("date : ", date);

            const queryDate = new Date(date);  // Assuming `date` is in 'YYYY-MM-DD' format


            const slots = await SlotModel.find({ turfId, day, date: queryDate, isExpired: false }).exec();
            // console.log("SLOTS : ", slots);

            return slots as unknown as Slot[]
        } catch (error: any) {
            throw new ErrorResponse(error.message, error.status);
        }
    }

    async bookTheSlots(bookingDets: any): Promise<object> {
        try {

            const slots = bookingDets.selectedSlots

            for (const slot of slots) {
                const updatedSlot = await SlotModel.findOneAndUpdate(
                    { _id: slot._id, isBooked: false }, // Ensure the slot isn't already booked
                    {
                        $set: { isBooked: true, userId: bookingDets.userId } // Mark as booked and add userId
                    },
                    { new: true } // Return the updated document
                );

                if (!updatedSlot) {
                    throw new ErrorResponse(
                        `Slot with ID ${slot._id} is already booked or doesn't exist.`,
                        400
                    );
                }
            }

            const user = await UserModel.findById(bookingDets?.userId)

            if (!user) {
                throw new ErrorResponse("User not found.", 404);
            }

            const userDet = {
                name: user?.name,
                email: user?.email,
                phone: user?.phone
            }
            bookingDets.userDetails = userDet

            const newBooking = new BookingModel(bookingDets);
            const savedBooking = await newBooking.save();

            const payment: Payment = {
                bookingId: savedBooking._id,
                userId: bookingDets.userId,
                amount: bookingDets.totalAmount,
                paymentStatus: bookingDets.paymentStatus,
                paymentMethod: bookingDets.paymentMethod,
                paymentTransactionId: bookingDets.paymentTransactionId,
                paymentDate: bookingDets.bookingDate,
                isRefunded: false,
                refundTransactionId: undefined,
                refundDate: undefined,
                userDetails: {
                    name: bookingDets.userDetails.name,
                    email: bookingDets.userDetails.email,
                    phone: bookingDets.userDetails.phone
                }
            }

            const paymentProcess = new PaymentModel(payment);
            const paymentSaved = await paymentProcess.save();
            console.log("Returning Successful form BookingUsrRepo :)");

            return {
                success: true,
                message: "Booking completed successfully.",
                booking: savedBooking,
            };

        } catch (error: any) {
            throw new ErrorResponse(error.message, error.status);
        }
    }

    async getBookingByUserId(userId: string): Promise<[] | null> {
        try {
            const bookings = await BookingModel.find({ userId }).populate({
                path: 'turfId',
                select: 'turfName address price location images',
            });

            return bookings.length > 0 ? bookings as [] : null;
        } catch (error) {
            console.error("Error fetching bookings for user:", userId, error);
            throw new Error("Error fetching bookings. Please try again later.");
        }
    }
}