import { Schema, model } from "mongoose";
import { turfValidators } from "../validators/Turf.validators";
import { Turf } from "../../../domain/entities/Turf";

const TurfSchema = new Schema<Turf>(
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
        address: {
            type: String,
            required: true,
            validate: {
                validator: turfValidators.addressValidator.validator,
                message: turfValidators.addressValidator.message,
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
        supportedGames: {
            type: [String],
            required: true,
            validate: {
                validator: turfValidators.gameValidator.validator,
                message: turfValidators.gameValidator.message,
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
                type: [
                    {
                        day: {
                            type: String,
                            required: true,
                            enum: [
                                "Sunday",
                                "Monday",
                                "Tuesday",
                                "Wednesday",
                                "Thursday",
                                "Friday",
                                "Saturday",
                            ],
                        },
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
                        price: {
                            type: Number,
                            required: true,
                            min: [0, "Price must be a positive number."],
                        },
                    },
                ],
                required: true,
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
        generatedSlots: {
            fromDate: { type: Date },
            toDate: { type: Date },
        },
    },
    {
        timestamps: true,
    }
);

export default model("Turf", TurfSchema);

