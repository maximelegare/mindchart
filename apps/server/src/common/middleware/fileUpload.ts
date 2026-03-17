import multer from "multer";
import { Request } from "express";
import path from "path";
import fs from "fs";

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure storage - use memory storage for API forwarding
const storage = multer.memoryStorage();

// File filter function for audio files
const fileFilter = (
  req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  // Define allowed audio file types
  const allowedTypes = [
    "audio/mpeg", // MP3
    "audio/mp3", // MP3
    "audio/wav", // WAV
    "audio/wave", // WAV
    "audio/x-wav", // WAV
    "audio/mp4", // M4A
    "audio/m4a", // M4A
    "audio/aac", // AAC
    "audio/ogg", // OGG
    "audio/webm", // WebM
    "audio/flac", // FLAC
    "audio/x-flac", // FLAC
    "audio/3gpp", // 3GPP
    "audio/3gp", // 3GP
    "audio/amr", // AMR
    "audio/x-ms-wma", // WMA
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error(
        `Audio file type ${file.mimetype} is not allowed. Supported formats: MP3, WAV, M4A, AAC, OGG, WebM, FLAC, 3GPP, AMR, WMA`
      )
    );
  }
};

// Configure multer
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit for audio files
    files: 1, // Only one audio file per request for transcription
  },
});

// Middleware for single audio file upload
export const uploadSingleAudio = (fieldName: string = "audio") =>
  upload.single(fieldName);

// Middleware for multiple files upload
export const uploadMultiple = (fieldName: string, maxCount: number = 5) =>
  upload.array(fieldName, maxCount);

// Middleware for multiple fields with different file counts
export const uploadFields = (fields: multer.Field[]) => upload.fields(fields);

// Middleware for any file upload (no field restrictions)
export const uploadAny = upload.any();

// Legacy exports for backward compatibility
export const uploadSingle = uploadSingleAudio;

// Error handler for multer errors
export const handleUploadError = (
  error: any,
  req: Request,
  res: any,
  next: any
) => {
  if (error instanceof multer.MulterError) {
    if (error.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        error: "File too large",
        message: "Audio file size exceeds the 50MB limit for API processing",
      });
    }
    if (error.code === "LIMIT_FILE_COUNT") {
      return res.status(400).json({
        error: "Too many files",
        message: "Only one audio file allowed per request for API processing",
      });
    }
    if (error.code === "LIMIT_UNEXPECTED_FILE") {
      return res.status(400).json({
        error: "Unexpected field",
        message: "Unexpected file field in request",
      });
    }
  }

  if (error.message.includes("File type")) {
    return res.status(400).json({
      error: "Invalid file type",
      message: error.message,
    });
  }

  next(error);
};

export default upload;
