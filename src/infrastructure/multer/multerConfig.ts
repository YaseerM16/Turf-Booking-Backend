// import multer from 'multer';
import multer from "multer"
import path from 'path';
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3"; // Importing from AWS SDK v3
import { config } from "../../config/config";
import multerS3 from "multer-s3"
import fs from "fs"

const uploadDir = path.join(__dirname, 'uploads');

if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir); // Local upload directory
    },
    filename: (req, file, cb) => {
        const uniqueName = `${Date.now()}-${file.originalname}`;
        cb(null, uniqueName);
    },
});



const fileFilter = (req: any, file: any, cb: any) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Unsupported file type'), false);
    }
};


const region = config.S3_REGION!;
const accessKeyId = config.S3_ACCESS_KEY!;
const secretAccessKey = config.S3_SECRET_KEY!;

// If any of these are undefined, throw an error
if (!region || !accessKeyId || !secretAccessKey) {
    throw new Error("AWS S3 credentials or region are missing in configuration.");
}

const s3 = new S3Client({
    region, // Non-null assertion
    credentials: {
        accessKeyId, // Non-null assertion
        secretAccessKey, // Non-null assertion
    }
});

const S3storage = multerS3({
    s3: s3,
    bucket: config.S3_BUCKET_NAME!,
    contentType: multerS3.AUTO_CONTENT_TYPE,
    metadata: function (req, file, cb) {
        cb(null, { fieldName: file.fieldname });
    },
    key: function (req, file, cb) {
        cb(null, Date.now().toString())
    }
})

export const uploadMiddleware = multer({
    storage: S3storage,
    fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
});
