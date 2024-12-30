import { Company } from "../../../domain/entities/Company";
import { Slot } from "../../../domain/entities/Slot";
import { Turf } from "../../../domain/entities/Turf";
import { ICompanyRepository } from "../../../domain/repositories/ICompanyRepository";
import { ErrorResponse } from "../../../utils/errors";
import TurfService, { SlotModel } from "../../services/TurfService";
import CompanyModel from "../models/CompanyModel";
import TurfModel from "../models/TurfModel";

export class CompanyRepository implements ICompanyRepository {


    async findByEmail(email: string): Promise<Company | null> {
        try {
            const companyDoc = await CompanyModel.findOne({ companyemail: email })
            return companyDoc ? companyDoc : null
        } catch (error: any) {
            throw new ErrorResponse(error.message, error.status);
        }
    }

    async create(company: Company): Promise<Company> {
        try {
            const companyDoc = new CompanyModel(company)
            await companyDoc.save()
            return companyDoc

        } catch (error: any) {
            throw new ErrorResponse(error.message, error.status);
        }
    }

    async update(id: string, value: any): Promise<Company | null> {
        try {
            const updatedCompany = await CompanyModel.findByIdAndUpdate(id, value, {
                new: true,
                fields: "-password"
            });
            return updatedCompany
        } catch (error: any) {
            throw new ErrorResponse(error.message, error.status);
        }
    }


    /// <-  Turf Repo  -> ///

    async registerTurf(turf: Turf): Promise<Turf | null> {
        try {
            const savedTurf = await TurfService.registerTurf(turf)
            await TurfService.markExpiredSlots()
            return savedTurf as unknown as Turf
        } catch (error: any) {
            throw new ErrorResponse(error.message, error.status);
        }
    }

    async getTurfs(companyId: string): Promise<Turf[] | null> {
        try {
            if (!companyId) throw new ErrorResponse("CompanyId is not Provided :", 500);

            const turfs = await TurfModel.find({ companyId })

            return turfs as unknown as Turf[]
        } catch (error: any) {
            throw new ErrorResponse(error.message, error.status);
        }
    }

    async blockTurf(turfId: string): Promise<object> {
        try {
            if (!turfId) throw new ErrorResponse("turfId is not Provided", 400);

            const updatedTurf = await TurfModel.findByIdAndUpdate(
                turfId,
                { isBlocked: true },
                { new: true }
            );

            if (!updatedTurf) {
                throw new ErrorResponse("Turf not found", 404);
            }

            return {
                success: true,
                message: "Turf successfully blocked",
                data: updatedTurf,
            };
        } catch (error: any) {
            throw new ErrorResponse(error.message, error.status);
        }
    }

    async unBlockTurf(turfId: string): Promise<object> {
        try {
            if (!turfId) throw new ErrorResponse("turfId is not Provided", 400);

            const updatedTurf = await TurfModel.findByIdAndUpdate(
                turfId,
                { isBlocked: false },
                { new: true }
            );

            if (!updatedTurf) {
                throw new ErrorResponse("Turf not found", 404);
            }

            return {
                success: true,
                message: "Turf successfully Un-blocked",
                data: updatedTurf,
            };
        } catch (error: any) {
            throw new ErrorResponse(error.message, error.status);
        }
    }

    async getTurfById(turfId: string): Promise<Turf | null> {
        try {
            if (!turfId) throw new ErrorResponse("TurfId is not Provided in Repository :", 500);

            const turf = await TurfModel.findById(turfId);
            if (!turf) throw new ErrorResponse("Turf not found", 404);

            return turf as unknown as Turf

        } catch (error: any) {
            throw new ErrorResponse(error.message, error.status);
        }
    }

    async deleteTurfImage(turfId: string, index: number): Promise<String[] | null> {
        try {
            if (!turfId || index === undefined || index === null) throw new ErrorResponse("TurfId or Index not Provided in Repository :", 500);

            const turf = await TurfModel.findById(turfId);

            if (!turf) {
                throw new Error("Turf not found");
            }

            if (index < 0 || index >= turf.images.length) {
                throw new Error("Invalid index");
            }

            turf.images.splice(index, 1);

            await turf.save();

            return turf.images;

        } catch (error: any) {
            throw new ErrorResponse(error.message, error.status);
        }
    }

    async editTurfById(turfId: string, turf: Turf): Promise<Turf | null> {
        try {
            if (!turfId) throw new ErrorResponse("TurfId or Index not Provided in Repository :", 400);
            const turfExist = await TurfModel.findById(turfId);
            if (!turfExist) {
                throw new ErrorResponse("Turf not found", 404);
            }

            const updatedImages = [
                ...(turfExist.images || []), // Retain existing images
                ...(turf.images || []), // Append new images
            ];

            const { images, ...restTurfDetails } = turf;


            const updatedTurf = await TurfModel.findByIdAndUpdate(
                turfId,
                {
                    $set: { ...restTurfDetails },
                    images: updatedImages,
                },
                { new: true }
            );

            return updatedTurf as unknown as Turf;

        } catch (error) {

        }
        throw new Error("Method not implemented.");
    }


    ///   <-   Slot   ->  ///
    async getSlotByDay(turfId: string, day: string, date: string): Promise<Slot[] | null> {
        try {
            const slots = await SlotModel.find({ turfId, day, date, isExpired: false }).populate('userId').exec();
            return slots as unknown as Slot[]
        } catch (error: any) {
            throw new ErrorResponse(error.message, error.status);
        }
    }

    async makeSlotUnavail(slotId: string, turfId: string): Promise<object> {
        try {
            if (!turfId || !slotId) throw new ErrorResponse("TurfId or SlotId not Provided in Repository :", 400);
            const updatedSlot = await SlotModel.findOneAndUpdate(
                { _id: slotId, turfId },
                { isUnavail: true },
                { new: true }
            );

            if (!updatedSlot) {
                throw new ErrorResponse("Slot not found", 404);
            }

            return { success: true, updatedSlot } as object
        } catch (error: any) {
            throw new ErrorResponse(error.message, error.status);
        }
    }

    async makeSlotAvail(slotId: string, turfId: string): Promise<object> {
        try {
            if (!turfId || !slotId) throw new ErrorResponse("TurfId or SlotId not Provided in Repository :", 400);
            const updatedSlot = await SlotModel.findOneAndUpdate(
                { _id: slotId, turfId },  // Find slot by slotId and turfId
                { isUnavail: false },       // Update the slot to make it unavailable
                { new: true }              // Return the updated slot after modification
            );

            // If no slot was found, return an error
            if (!updatedSlot) {
                throw new ErrorResponse("Slot not found", 404);
            }

            return { success: true, updatedSlot } as object
        } catch (error: any) {
            throw new ErrorResponse(error.message, error.status);
        }
    }

    async addWorkingDays(turfId: string, payload: any): Promise<object> {
        try {
            const { workingDays, fromTime, toTime } = payload;

            if (!workingDays || !fromTime || !toTime || !turfId) {
                throw new ErrorResponse("Payload data for adding days is missing  :", 500);
            }

            const slots = TurfService.generateSlotsForUpdate(turfId, fromTime, toTime, workingDays);

            // Save the new slots to the Slot collection and store the result
            const insertedSlots = await SlotModel.insertMany(slots);

            // Double-check if all intended slots were successfully inserted
            if (insertedSlots.length !== slots.length) {
                throw new ErrorResponse(
                    `Mismatch in inserted slots. Expected: ${slots.length}, Actual: ${insertedSlots.length}`,
                    500
                );
            }

            // Update the working days in the Turf collection
            const updatedTurf = await TurfModel.findByIdAndUpdate(
                turfId,
                {
                    $set: {
                        "workingSlots.fromTime": fromTime,
                        "workingSlots.toTime": toTime,
                    },
                    $addToSet: {
                        "workingSlots.workingDays": { $each: workingDays },
                    },
                },
                { new: true } // Return the updated document
            );

            if (!updatedTurf) {
                throw new ErrorResponse(`Failed to update working days for turfId: ${turfId}`, 500);
            }

            // Return a success message with the count of inserted slots
            return {
                success: true,
                message: `${insertedSlots.length} slots added successfully and working days updated for turfId: ${turfId}`,
                insertedSlotIds: insertedSlots.map(slot => slot._id),
                updatedTurf,
            };

        } catch (error: any) {
            throw new ErrorResponse(error.message, error.status);
        }
    }

}

