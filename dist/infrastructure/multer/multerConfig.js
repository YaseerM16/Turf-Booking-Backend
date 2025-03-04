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
exports.uploadMiddleware = exports.s3 = void 0;
exports.uploadToS3 = uploadToS3;
// import multer from 'multer';
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const client_s3_1 = require("@aws-sdk/client-s3"); // Importing from AWS SDK v3
const config_1 = require("../../config/config");
const multer_s3_1 = __importDefault(require("multer-s3"));
const uuid_1 = require("uuid");
const fs_1 = __importDefault(require("fs"));
const uploadDir = path_1.default.join(__dirname, 'uploads');
if (!fs_1.default.existsSync(uploadDir)) {
    fs_1.default.mkdirSync(uploadDir);
}
const storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir); // Local upload directory
    },
    filename: (req, file, cb) => {
        const uniqueName = `${Date.now()}-${file.originalname}`;
        cb(null, uniqueName);
    },
});
const fileFilter = (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    }
    else {
        cb(new Error('Unsupported file type'), false);
    }
};
const region = config_1.config.S3_REGION;
const accessKeyId = config_1.config.S3_ACCESS_KEY;
const secretAccessKey = config_1.config.S3_SECRET_KEY;
// If any of these are undefined, throw an error
if (!region || !accessKeyId || !secretAccessKey) {
    throw new Error("AWS S3 credentials or region are missing in configuration.");
}
exports.s3 = new client_s3_1.S3Client({
    region, // Non-null assertion
    credentials: {
        accessKeyId, // Non-null assertion
        secretAccessKey, // Non-null assertion
    }
});
function uploadToS3(buffer, filename, mimetype) {
    return __awaiter(this, void 0, void 0, function* () {
        const bucketName = config_1.config.S3_BUCKET_NAME;
        if (!bucketName) {
            throw new Error("AWS_BUCKET_NAME is not defined");
        }
        const key = `uploads/${(0, uuid_1.v4)()}-${filename}`; // Unique filename
        const uploadParams = {
            Bucket: bucketName,
            Key: key,
            Body: buffer,
            ContentType: mimetype,
        };
        yield exports.s3.send(new client_s3_1.PutObjectCommand(uploadParams));
        return `https://${bucketName}.s3.${region}.amazonaws.com/${key}`;
    });
}
const S3storage = (0, multer_s3_1.default)({
    s3: exports.s3,
    bucket: config_1.config.S3_BUCKET_NAME,
    contentType: multer_s3_1.default.AUTO_CONTENT_TYPE,
    metadata: function (req, file, cb) {
        cb(null, { fieldName: file.fieldname });
    },
    key: function (req, file, cb) {
        cb(null, Date.now().toString());
    }
});
exports.uploadMiddleware = (0, multer_1.default)({
    storage: S3storage,
    fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
}).fields([
    { name: "profileImage", maxCount: 1 },
    { name: "TurfImages", maxCount: 5 }
]);
