import mongoose from "mongoose";
import { Turf } from "../../domain/entities/Turf";
import TurfModel from "../database/models/TurfModel";
import { ErrorResponse } from "../../utils/errors";
import cron from "node-cron";
import { RRule, Weekday } from 'rrule';



// Define Slot model
export const SlotModel = mongoose.model("Slot", new mongoose.Schema({
    turfId: { type: mongoose.Schema.Types.ObjectId, ref: "Turf", required: true },
    day: { type: String, required: true }, // E.g., "Sunday"
    date: { type: Date, required: true }, // E.g., "2024-12-15"
    slot: { type: String, required: true },
    isBooked: { type: Boolean, default: false },
    isUnavail: { type: Boolean, default: false },
    isExpired: { type: Boolean, default: false },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "Clean-User", default: null }, // New field
}));

class TurfService {
    async registerTurf(turf: Turf): Promise<Turf | null> {
        const session = await mongoose.startSession();
        session.startTransaction();
        try {
            const newTurf = new TurfModel(turf);
            const savedTurf = await newTurf.save({ session });

            // Extract working slot details
            const { fromTime, toTime, workingDays } = turf.workingSlots;

            // Generate slots
            const slots = this.generateSlots(savedTurf._id as any, fromTime, toTime, workingDays);

            // Save slots in the Slot collection
            await SlotModel.insertMany(slots, { session });

            await session.commitTransaction();
            session.endSession();
            return savedTurf as unknown as Turf;
        } catch (error: any) {
            await session.abortTransaction();
            session.endSession();
            throw new ErrorResponse(error.message, error.status);
        }
    }

    private generateSlots(turfId: string, fromTime: string, toTime: string, workingDays: string[]) {
        const slots: any[] = [];
        const startHour = parseInt(fromTime.split(":")[0]);
        const endHour = parseInt(toTime.split(":")[0]);

        // Get the current date
        const currentDate = new Date();
        const nextMonthDate = new Date(currentDate);
        nextMonthDate.setMonth(currentDate.getMonth() + 1);

        // Generate the recurrence rule for monthly slots
        const rule = new RRule({
            freq: RRule.MONTHLY,
            byweekday: workingDays.map(day => this.getRRuleWeekday(day)), // Convert working days to RRule format
            dtstart: currentDate, // Start date
            until: nextMonthDate, // End at the exact date next month
        });

        // Get the dates for the next 12 months based on the recurrence rule
        const recurrenceDates = rule.all();

        recurrenceDates.forEach(date => {
            workingDays.forEach(dayName => {
                // Check if the day matches the working day
                if (date.toLocaleDateString('en-US', { weekday: 'long' }) === dayName) {
                    for (let hour = startHour; hour < endHour; hour++) {
                        const fromSlot = `${hour.toString().padStart(2, "0")}:00`;
                        const toSlot = `${(hour + 1).toString().padStart(2, "0")}:00`;
                        slots.push({
                            turfId,
                            day: dayName,  // E.g., "Sunday"
                            date: date.toISOString().split("T")[0],  // Date string in "YYYY-MM-DD"
                            slot: `${fromSlot} - ${toSlot}`,
                            isBooked: false,
                        });
                    }
                }
            });
        });

        return slots;
    }

    // Function to generate slots for the updated working days
    public generateSlotsForUpdate(turfId: string, fromTime: string, toTime: string, workingDays: string[]) {
        const slots: any[] = [];
        const startHour = parseInt(fromTime.split(":")[0]);
        const endHour = parseInt(toTime.split(":")[0]);

        // Define the date range for the slots (e.g., next month)
        const currentDate = new Date();
        const nextMonthDate = new Date(currentDate);
        nextMonthDate.setMonth(currentDate.getMonth() + 1);

        // Generate the recurrence rule for the updated working days
        const rule = new RRule({
            freq: RRule.MONTHLY,
            byweekday: workingDays.map(day => this.getRRuleWeekday(day)), // Convert working days to RRule format
            dtstart: currentDate, // Start date
            until: nextMonthDate, // End date
        });

        // Get the recurrence dates based on the rule
        const recurrenceDates = rule.all();

        recurrenceDates.forEach(date => {
            workingDays.forEach(dayName => {
                // Check if the day matches the working day
                if (date.toLocaleDateString('en-US', { weekday: 'long' }) === dayName) {
                    for (let hour = startHour; hour < endHour; hour++) {
                        const fromSlot = `${hour.toString().padStart(2, "0")}:00`;
                        const toSlot = `${(hour + 1).toString().padStart(2, "0")}:00`;
                        slots.push({
                            turfId,
                            day: dayName, // E.g., "Sunday"
                            date: date.toISOString().split("T")[0], // Date string in "YYYY-MM-DD"
                            slot: `${fromSlot} - ${toSlot}`,
                            isBooked: false,
                        });
                    }
                }
            });
        });

        return slots;
    }

    // Helper function to map day names to RRule weekday format
    private getRRuleWeekday(dayName: string): Weekday {
        const days: { [key: string]: Weekday } = {
            Sunday: RRule.SU,
            Monday: RRule.MO,
            Tuesday: RRule.TU,
            Wednesday: RRule.WE,
            Thursday: RRule.TH,
            Friday: RRule.FR,
            Saturday: RRule.SA
        };
        return days[dayName];
    }

    // Method to mark expired slots
    async markExpiredSlots(): Promise<void> {
        const currentDate = new Date();
        const currentTime = currentDate.toTimeString().slice(0, 5); // Current time in HH:MM format
        const currentMinutes = currentDate.getMinutes();

        try {
            // Fetch slots where date is today and extract 'fromTime' from 'slot' field
            const expiredSlots = await SlotModel.find({
                date: { $eq: new Date(currentDate.toDateString()) }, // Same day slots
                isExpired: false, // Only non-expired slots
            });

            const slotsToExpire = expiredSlots.filter((slot) => {
                const [fromTime] = slot.slot.split(" - "); // Extract the starting time
                const [hour, minute] = fromTime.split(":").map(Number);

                // Calculate the start time in minutes from midnight
                const startTimeInMinutes = hour * 60 + minute;
                const currentTimeInMinutes = currentDate.getHours() * 60 + currentMinutes;

                // Add a 10-minute grace period before expiry
                return startTimeInMinutes + 10 <= currentTimeInMinutes; // Slot expired after grace period
            });

            // Update all slots that need to be expired
            const slotIdsToExpire = slotsToExpire.map((slot) => slot._id);

            if (slotIdsToExpire.length > 0) {
                await SlotModel.updateMany(
                    { _id: { $in: slotIdsToExpire } },
                    { $set: { isExpired: true } }
                );
                console.log(`${slotIdsToExpire.length} slots marked as expired.`);
            } else {
                console.log("No slots to expire at this time.");
            }
        } catch (error: any) {
            console.error("Error updating expired slots:", error.message);
            throw new Error(`Error updating expired slots: ${error.message}`);
        }
    }


    // Cron job to mark expired slots every hour
    scheduleSlotExpiryJob() {
        cron.schedule("0 * * * *", async () => {
            try {
                await this.markExpiredSlots();
            } catch (error: any) {
                console.error("Error during cron job:", error.message);
            }
        });
    }
}

const turfService = new TurfService()
turfService.scheduleSlotExpiryJob()

export default new TurfService();
