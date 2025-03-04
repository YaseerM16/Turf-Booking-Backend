"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const Turf_validators_1 = require("../validators/Turf.validators");
const TurfSchema = new mongoose_1.Schema({
    companyId: {
        type: mongoose_1.Schema.Types.ObjectId,
        required: true,
        ref: "Company",
    },
    turfName: {
        type: String,
        required: true,
        validate: {
            validator: Turf_validators_1.turfValidators.turfName.validator,
            message: Turf_validators_1.turfValidators.turfName.message,
        },
    },
    address: {
        type: String,
        required: true,
        validate: {
            validator: Turf_validators_1.turfValidators.addressValidator.validator,
            message: Turf_validators_1.turfValidators.addressValidator.message,
        },
    },
    description: {
        type: String,
        required: true,
        validate: {
            validator: Turf_validators_1.turfValidators.description.validator,
            message: Turf_validators_1.turfValidators.description.message,
        },
    },
    turfSize: {
        type: String,
        required: true,
        validate: {
            validator: Turf_validators_1.turfValidators.turfSize.validator,
            message: Turf_validators_1.turfValidators.turfSize.message,
        },
    },
    turfType: {
        type: String,
        required: true,
        validate: {
            validator: Turf_validators_1.turfValidators.turfType.validator,
            message: Turf_validators_1.turfValidators.turfType.message,
        },
    },
    price: {
        type: Number,
        required: true,
        validate: {
            validator: Turf_validators_1.turfValidators.price.validator,
            message: Turf_validators_1.turfValidators.price.message,
        },
    },
    images: {
        type: [String],
        validate: {
            validator: Turf_validators_1.turfValidators.images.validator,
            message: Turf_validators_1.turfValidators.images.message,
        },
    },
    facilities: {
        type: [String],
        required: true,
        validate: {
            validator: Turf_validators_1.turfValidators.facilities.validator,
            message: Turf_validators_1.turfValidators.facilities.message,
        },
    },
    supportedGames: {
        type: [String],
        required: true,
        validate: {
            validator: Turf_validators_1.turfValidators.gameValidator.validator,
            message: Turf_validators_1.turfValidators.gameValidator.message,
        },
    },
    location: {
        latitude: {
            type: Number,
            required: true,
            validate: {
                validator: Turf_validators_1.turfValidators.latitude.validator,
                message: Turf_validators_1.turfValidators.latitude.message,
            },
        },
        longitude: {
            type: Number,
            required: true,
            validate: {
                validator: Turf_validators_1.turfValidators.longitude.validator,
                message: Turf_validators_1.turfValidators.longitude.message,
            },
        },
    },
    workingSlots: {
        fromTime: {
            type: String,
            required: true,
            validate: {
                validator: Turf_validators_1.turfValidators.fromTime.validator,
                message: Turf_validators_1.turfValidators.fromTime.message,
            },
        },
        toTime: {
            type: String,
            required: true,
            validate: {
                validator: Turf_validators_1.turfValidators.toTime.validator,
                message: Turf_validators_1.turfValidators.toTime.message,
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
                            validator: Turf_validators_1.turfValidators.fromTime.validator,
                            message: Turf_validators_1.turfValidators.fromTime.message,
                        },
                    },
                    toTime: {
                        type: String,
                        required: true,
                        validate: {
                            validator: Turf_validators_1.turfValidators.toTime.validator,
                            message: Turf_validators_1.turfValidators.toTime.message,
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
}, {
    timestamps: true,
});
exports.default = (0, mongoose_1.model)("Turf", TurfSchema);
