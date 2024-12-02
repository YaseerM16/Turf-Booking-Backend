import { Schema, model } from "mongoose";
import { turfValidators } from "../validators/Turf.validators";

const TurfSchema = new Schema(
    {
        companyId: {
            type: Schema.Types.ObjectId,
            required: true,
            ref: "Company",
        },
        turfName: {
            type: String,
            required: true,
            validate: {
                validator: turfValidators.turfName.validator,
                message: turfValidators.turfName.message,
            },
        },
        description: {
            type: String,
            required: true,
            validate: {
                validator: turfValidators.description.validator,
                message: turfValidators.description.message,
            },
        },
        turfSize: {
            type: String,
            required: true,
            validate: {
                validator: turfValidators.turfSize.validator,
                message: turfValidators.turfSize.message,
            },
        },
        turfType: {
            type: String,
            required: true,
            validate: {
                validator: turfValidators.turfType.validator,
                message: turfValidators.turfType.message,
            },
        },
        price: {
            type: Number,
            required: true,
            validate: {
                validator: turfValidators.price.validator,
                message: turfValidators.price.message,
            },
        },
        images: {
            type: [String],
            validate: {
                validator: turfValidators.images.validator,
                message: turfValidators.images.message,
            },
        },
        facilities: {
            type: [String],
            required: true,
            validate: {
                validator: turfValidators.facilities.validator,
                message: turfValidators.facilities.message,
            },
        },
        location: {
            latitude: {
                type: Number,
                required: true,
                validate: {
                    validator: turfValidators.latitude.validator,
                    message: turfValidators.latitude.message,
                },
            },
            longitude: {
                type: Number,
                required: true,
                validate: {
                    validator: turfValidators.longitude.validator,
                    message: turfValidators.longitude.message,
                },
            },
        },
        workingSlots: {
            fromTime: {
                type: String,
                required: true,
                validate: {
                    validator: turfValidators.fromTime.validator,
                    message: turfValidators.fromTime.message,
                },
            },
            toTime: {
                type: String,
                required: true,
                validate: {
                    validator: turfValidators.toTime.validator,
                    message: turfValidators.toTime.message,
                },
            },
            workingDays: {
                type: [String],
                required: true,
                validate: {
                    validator: turfValidators.workingDays.validator,
                    message: turfValidators.workingDays.message,
                },
            },
        },
        isActive: {
            type: Boolean,
            default: true,
        },
        isDelete: {
            type: Boolean,
            default: false,
        },
        isBlocked: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
    }
);

export default model("Turf", TurfSchema);
