import mongoose from "mongoose";
import { Turf } from "../../domain/entities/Turf";
import TurfModel from "../database/models/TurfModel";
import { ErrorResponse } from "../../utils/errors";
Turf
TurfModel

// Define Slot model
const SlotModel = mongoose.model("Slot", new mongoose.Schema({
    turfId: { type: mongoose.Schema.Types.ObjectId, ref: "Turf", required: true },
    day: { type: String, required: true },
    slot: { type: String, required: true },
    isBooked: { type: Boolean, default: false },
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

        for (const day of workingDays) {
            for (let hour = startHour; hour < endHour; hour++) {
                const fromSlot = `${hour.toString().padStart(2, "0")}:00`;
                const toSlot = `${(hour + 1).toString().padStart(2, "0")}:00`;
                slots.push({
                    turfId,
                    day,
                    slot: `${fromSlot} - ${toSlot}`, // Removed extra space after slot
                    isBooked: false,
                });
            }
        }
        return slots;
    }

}

export default new TurfService();