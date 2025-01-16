import mongoose from "mongoose";
import { Turf } from "../../domain/entities/Turf";
import TurfModel from "../database/models/TurfModel";
import { ErrorResponse } from "../../shared/utils/errors";
import cron from "node-cron";
import { RRule, Weekday } from 'rrule';
import { SlotModel } from "../database/models/SlotModel";
import { DayRank, DayValue } from "../../shared/utils/constants";


class TurfService {
    async registerTurf(turf: Turf, workingDaysArr: string[]): Promise<Turf | null> {
        const session = await mongoose.startSession();
        session.startTransaction();
        try {
            const maxDayIndex = Math.max(
                ...workingDaysArr.map((day) => DayRank[day as keyof typeof DayRank])
            );

            // console.log("MAXXX DAy :", maxDay);

            const maxDay = DayValue[maxDayIndex as keyof typeof DayValue]
            const fromDate = new Date();
            const nextMonth = fromDate.getMonth() + 1; // Get next month
            const year = nextMonth > 11 ? fromDate.getFullYear() + 1 : fromDate.getFullYear();
            const month = nextMonth % 12;

            // Determine the last day of the next month
            const lastDayOfNextMonth = new Date(year, month + 1, 0); // `0` gives the last day of the previous month

            // Find the date of the `maxDay` in the last week of the next month
            const lastWeekStart = new Date(lastDayOfNextMonth);
            lastWeekStart.setDate(lastDayOfNextMonth.getDate() - 6); // Start of the last week

            let toDate = new Date(lastDayOfNextMonth); // Default to the last day
            for (let i = 0; i < 7; i++) {
                const currentDay = (lastWeekStart.getDay() + i) % 7; // Get days in the last week
                if (DayValue[currentDay as keyof typeof DayValue] === maxDay) {
                    toDate = new Date(lastWeekStart);
                    toDate.setDate(lastWeekStart.getDate() + i); // Set to matching `maxDay`
                    break;
                }
            }

            const newToDate = new Date(toDate);
            newToDate.setDate(toDate.getDate() + 1); // Add 1 day

            // Add `generatedSlots` field to the turf object
            turf.generatedSlots = { fromDate, toDate: newToDate };

            const newTurf = new TurfModel(turf);
            const savedTurf = await newTurf.save({ session });

            // Extract working slot details
            const { fromTime, toTime, workingDays } = turf.workingSlots;

            const workingDaysArray = workingDays.map((dayDetails) => dayDetails.day);
            // console.log("WORKING days :", workingDaysArray);

            // Generate slots
            const slots = this.generateSlots(savedTurf._id as any, fromTime, toTime, workingDaysArray, newToDate);

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

    private generateSlots(turfId: string, fromTime: string, toTime: string, workingDays: string[], upto: Date) {
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
            until: upto, // End at the exact date next month
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
    public generateSlotsForUpdate(turfId: string, fromTime: string, toTime: string, workingDays: string[], upto?: Date) {
        const slots: any[] = [];
        const startHour = parseInt(fromTime.split(":")[0]);
        const endHour = parseInt(toTime.split(":")[0]);

        // Define the date range for the slots (e.g., next month)
        const currentDate = new Date();
        const nextMonth = currentDate.getMonth() + 1; // Calculate the next month
        const year = nextMonth > 11 ? currentDate.getFullYear() + 1 : currentDate.getFullYear(); // Handle year rollover
        const month = nextMonth % 12; // Normalize the month (0-based index)

        // Set nextMonthDate to the last day of the next month
        const nextMonthDate = new Date(year, month + 1, 0); // `0` gets the last day of the previous month

        // console.log("Next Month End Date:", nextMonthDate);


        // Generate the recurrence rule for the updated working days
        const rule = new RRule({
            freq: RRule.MONTHLY,
            byweekday: workingDays.map(day => this.getRRuleWeekday(day)), // Convert working days to RRule format
            dtstart: currentDate, // Start date
            until: upto ? upto : nextMonthDate, // End date
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

    async generateSlotsForNextDay(turfId: string): Promise<void> {
        // Fetch the turf by ID
        // console.log("It began to generate next day's slots:");

        const turf = await TurfModel.findById(turfId);
        if (!turf) {
            throw new Error(`Turf with ID ${turfId} not found`);
        }

        const toDate = turf.generatedSlots?.toDate;
        if (!toDate) {
            throw new Error("No toDate found in generatedSlots");
        }

        const nextDate = new Date(toDate);

        // Increment the nextDate to start checking from the next day
        // nextDate.setDate(nextDate.getDate() + 1);

        // Loop until a matching day is found in the workingDays array
        let workingDaySpec: any = null;
        let dayName: string = "";

        do {
            dayName = nextDate.toLocaleDateString("en-US", { weekday: "long" }); // Get the day name (e.g., "Monday")

            // Check if the day exists in the workingDays
            workingDaySpec = turf.workingSlots.workingDays.find(
                (daySpec) => daySpec.day === dayName
            );

            if (!workingDaySpec) {
                nextDate.setDate(nextDate.getDate() + 1); // Increment the date if the day doesn't match
            }

        } while (!workingDaySpec); // Keep iterating until a valid working day is found

        // Extract the required details from the workingDaySpec
        const { fromTime, toTime, price } = workingDaySpec;

        nextDate.setDate(nextDate.getDate() + 1); // Increment the date if the day doesn't match
        // console.log("NextDate to the Generate :", nextDate);

        // Generate slots for the next day
        const slots = this.generateDailySlots(turfId, nextDate, dayName, fromTime, toTime, price);

        // Save the generated slots to the Slot collection
        await SlotModel.insertMany(slots);

        // Update the turf's generatedSlots.toDate to the new date

        turf.generatedSlots!.toDate = nextDate;
        await turf.save();

        // console.log("Turf is also saved with updated slots.");
    }



    private generateDailySlots(
        turfId: string,
        date: Date,
        dayName: string,
        fromTime: string,
        toTime: string,
        price: number
    ) {
        const slots: any[] = [];
        const startHour = parseInt(fromTime.split(":")[0]);
        const endHour = parseInt(toTime.split(":")[0]);

        for (let hour = startHour; hour < endHour; hour++) {
            const fromSlot = `${hour.toString().padStart(2, "0")}:00`;
            const toSlot = `${(hour + 1).toString().padStart(2, "0")}:00`;
            slots.push({
                turfId,
                day: dayName,
                date: date.toISOString().split("T")[0], // Date in "YYYY-MM-DD" format
                slot: `${fromSlot} - ${toSlot}`,
                price,
                isBooked: false,
            });
        }

        return slots;
    }
}

const turfService = new TurfService()
turfService.scheduleSlotExpiryJob()

export default new TurfService();
