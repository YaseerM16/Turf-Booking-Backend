"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const TurfModel_1 = __importDefault(require("../database/models/TurfModel"));
const errors_1 = require("../../shared/utils/errors");
const node_cron_1 = __importDefault(require("node-cron"));
const rrule_1 = require("rrule");
const SlotModel_1 = require("../database/models/SlotModel");
const constants_1 = require("../../shared/utils/constants");
class TurfService {
    registerTurf(turf, workingDaysArr) {
        return __awaiter(this, void 0, void 0, function* () {
            const session = yield mongoose_1.default.startSession();
            session.startTransaction();
            try {
                const maxDayIndex = Math.max(...workingDaysArr.map((day) => constants_1.DayRank[day]));
                // console.log("MAXXX DAy :", maxDay);
                const maxDay = constants_1.DayValue[maxDayIndex];
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
                    if (constants_1.DayValue[currentDay] === maxDay) {
                        toDate = new Date(lastWeekStart);
                        toDate.setDate(lastWeekStart.getDate() + i); // Set to matching `maxDay`
                        break;
                    }
                }
                const newToDate = new Date(toDate);
                newToDate.setDate(toDate.getDate() + 1); // Add 1 day
                // Add `generatedSlots` field to the turf object
                turf.generatedSlots = { fromDate, toDate: newToDate };
                const newTurf = new TurfModel_1.default(turf);
                const savedTurf = yield newTurf.save({ session });
                // Extract working slot details
                const { fromTime, toTime, workingDays } = turf.workingSlots;
                const workingDaysArray = workingDays.map((dayDetails) => dayDetails.day);
                // console.log("WORKING days :", workingDaysArray);
                // Generate slots
                const slots = this.generateSlots(savedTurf._id, fromTime, toTime, workingDaysArray, newToDate);
                // Save slots in the Slot collection
                yield SlotModel_1.SlotModel.insertMany(slots, { session });
                yield session.commitTransaction();
                session.endSession();
                return savedTurf;
            }
            catch (error) {
                yield session.abortTransaction();
                session.endSession();
                throw new errors_1.ErrorResponse(error.message, error.status);
            }
        });
    }
    generateSlots(turfId, fromTime, toTime, workingDays, upto) {
        const slots = [];
        const startHour = parseInt(fromTime.split(":")[0]);
        const endHour = parseInt(toTime.split(":")[0]);
        // Get the current date
        const currentDate = new Date();
        const nextMonthDate = new Date(currentDate);
        nextMonthDate.setMonth(currentDate.getMonth() + 1);
        // Generate the recurrence rule for monthly slots
        const rule = new rrule_1.RRule({
            freq: rrule_1.RRule.MONTHLY,
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
    // Function to generate slots for the updated working days
    generateSlotsForUpdate(turfId, fromTime, toTime, workingDays, upto) {
        const slots = [];
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
        const rule = new rrule_1.RRule({
            freq: rrule_1.RRule.MONTHLY,
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
    getRRuleWeekday(dayName) {
        const days = {
            Sunday: rrule_1.RRule.SU,
            Monday: rrule_1.RRule.MO,
            Tuesday: rrule_1.RRule.TU,
            Wednesday: rrule_1.RRule.WE,
            Thursday: rrule_1.RRule.TH,
            Friday: rrule_1.RRule.FR,
            Saturday: rrule_1.RRule.SA
        };
        return days[dayName];
    }
    // Method to mark expired slots
    markExpiredSlots() {
        return __awaiter(this, void 0, void 0, function* () {
            const currentDate = new Date();
            const currentTime = currentDate.toTimeString().slice(0, 5); // Current time in HH:MM format
            const currentMinutes = currentDate.getMinutes();
            try {
                // Fetch slots where date is today and extract 'fromTime' from 'slot' field
                const expiredSlots = yield SlotModel_1.SlotModel.find({
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
                    yield SlotModel_1.SlotModel.updateMany({ _id: { $in: slotIdsToExpire } }, { $set: { isExpired: true } });
                    console.log(`${slotIdsToExpire.length} slots marked as expired.`);
                }
                else {
                    console.log("No slots to expire at this time.");
                }
            }
            catch (error) {
                console.error("Error updating expired slots:", error.message);
                throw new Error(`Error updating expired slots: ${error.message}`);
            }
        });
    }
    // Cron job to mark expired slots every hour
    scheduleSlotExpiryJob() {
        node_cron_1.default.schedule("0 * * * *", () => __awaiter(this, void 0, void 0, function* () {
            try {
                yield this.markExpiredSlots();
            }
            catch (error) {
                console.error("Error during cron job:", error.message);
            }
        }));
    }
    generateSlotsForNextDay(turfId) {
        return __awaiter(this, void 0, void 0, function* () {
            // Fetch the turf by ID
            // console.log("It began to generate next day's slots:");
            var _a;
            const turf = yield TurfModel_1.default.findById(turfId);
            if (!turf) {
                throw new Error(`Turf with ID ${turfId} not found`);
            }
            const toDate = (_a = turf.generatedSlots) === null || _a === void 0 ? void 0 : _a.toDate;
            if (!toDate) {
                throw new Error("No toDate found in generatedSlots");
            }
            const nextDate = new Date(toDate);
            // Increment the nextDate to start checking from the next day
            // nextDate.setDate(nextDate.getDate() + 1);
            // Loop until a matching day is found in the workingDays array
            let workingDaySpec = null;
            let dayName = "";
            do {
                dayName = nextDate.toLocaleDateString("en-US", { weekday: "long" }); // Get the day name (e.g., "Monday")
                // Check if the day exists in the workingDays
                workingDaySpec = turf.workingSlots.workingDays.find((daySpec) => daySpec.day === dayName);
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
            yield SlotModel_1.SlotModel.insertMany(slots);
            // Update the turf's generatedSlots.toDate to the new date
            turf.generatedSlots.toDate = nextDate;
            yield turf.save();
            // console.log("Turf is also saved with updated slots.");
        });
    }
    generateDailySlots(turfId, date, dayName, fromTime, toTime, price) {
        const slots = [];
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
const turfService = new TurfService();
turfService.scheduleSlotExpiryJob();
exports.default = new TurfService();
