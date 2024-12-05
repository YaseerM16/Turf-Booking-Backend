import validator from "validator";

const turfValidationMessages = {
    turfName: "Turf name must be between 3 and 50 characters long",
    description: "Description must be between 10 and 500 characters long",
    turfSize: "Turf size must be valid (e.g., '5-a-side', '7-a-side')",
    turfType: "Turf type must be 'Football', 'Cricket', or 'Multi-purpose'",
    price: "Price must be a positive number",
    images: "Each image must be a valid URL",
    facilities: "At least one facility must be specified",
    latitude: "Latitude must be a valid number between -90 and 90",
    longitude: "Longitude must be a valid number between -180 and 180",
    fromTime: "Invalid time format for fromTime",
    toTime: "Invalid time format for toTime",
    workingDays: "Invalid day provided in workingDays",
    supportedGames: "At least one supported Game must be specified"
};

const turfNameValidator = (value: string) => validator.isLength(value, { min: 3, max: 50 });

const descriptionValidator = (value: string) => validator.isLength(value, { min: 10, max: 500 });

const turfSizeValidator = (value: string) =>
    /^(5s|7s|11s)$/.test(value);

const turfTypeValidator = (value: string) =>
    ["Open", "Closed"].includes(value);

const turfGameValidator = (value: string[]) => value.length > 0;

const priceValidator = (value: number) => value > 0;

const imagesValidator = (value: string[]) =>
    value.every((url) => validator.isURL(url));

const facilitiesValidator = (value: string[]) => value.length > 0;

const latitudeValidator = (value: number) => value >= -90 && value <= 90;

const longitudeValidator = (value: number) => value >= -180 && value <= 180;

const timeValidator = (value: string) =>
    /^([01]\d|2[0-3]):([0-5]\d)$/.test(value);

const workingDaysValidator = (value: string[]) =>
    value.every((day) =>
        ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].includes(day)
    );

export const turfValidators = {
    turfName: { validator: turfNameValidator, message: turfValidationMessages.turfName },
    description: { validator: descriptionValidator, message: turfValidationMessages.description },
    turfSize: { validator: turfSizeValidator, message: turfValidationMessages.turfSize },
    turfType: { validator: turfTypeValidator, message: turfValidationMessages.turfType },
    price: { validator: priceValidator, message: turfValidationMessages.price },
    images: { validator: imagesValidator, message: turfValidationMessages.images },
    facilities: { validator: facilitiesValidator, message: turfValidationMessages.facilities },
    latitude: { validator: latitudeValidator, message: turfValidationMessages.latitude },
    longitude: { validator: longitudeValidator, message: turfValidationMessages.longitude },
    fromTime: { validator: timeValidator, message: turfValidationMessages.fromTime },
    toTime: { validator: timeValidator, message: turfValidationMessages.toTime },
    workingDays: { validator: workingDaysValidator, message: turfValidationMessages.workingDays },
    gameValidator: { validator: turfGameValidator, message: turfValidationMessages.supportedGames }
};
