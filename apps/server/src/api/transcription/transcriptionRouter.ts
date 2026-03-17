import express, { type Request, type Response, type Router } from "express";
import { uploadSingleAudio } from "@/common/middleware/fileUpload";
import { ServiceResponse } from "@/common/models/serviceResponse";

export const transcriptionRouter: Router = express.Router();

// Audio transcription endpoint
transcriptionRouter.post(
  "/transcribe",
  uploadSingleAudio("audio"),
  async (req: Request, res: Response) => {
    try {
      if (!req.file) {
        const serviceResponse = ServiceResponse.failure(
          "No audio file uploaded",
          null,
          400
        );
        return res.status(serviceResponse.statusCode).send(serviceResponse);
      }

      // Validate file type
      const allowedMimeTypes = [
        "audio/mpeg",
        "audio/mp3",
        "audio/wav",
        "audio/wave",
        "audio/x-wav",
        "audio/mp4",
        "audio/m4a",
        "audio/aac",
        "audio/ogg",
        "audio/webm",
        "audio/flac",
        "audio/x-flac",
        "audio/3gpp",
        "audio/3gp",
        "audio/amr",
        "audio/x-ms-wma",
      ];

      if (!allowedMimeTypes.includes(req.file.mimetype)) {
        const serviceResponse = ServiceResponse.failure(
          "Invalid audio file type",
          {
            received: req.file.mimetype,
            supported: allowedMimeTypes,
          },
          400
        );
        return res.status(serviceResponse.statusCode).send(serviceResponse);
      }

      // Return the uploaded audio file info for your transcription processing
      const serviceResponse = ServiceResponse.success(
        "Audio file ready for processing",
        {
          audioFile: {
            originalName: req.file.originalname,
            size: req.file.size,
            mimetype: req.file.mimetype,
            buffer: req.file.buffer, // File data as Buffer - ready to send to external API
            fieldname: req.file.fieldname,
          },
        }
      );

      res.status(serviceResponse.statusCode).send(serviceResponse);
    } catch {
      const serviceResponse = ServiceResponse.failure(
        "Audio upload failed",
        null,
        500
      );
      res.status(serviceResponse.statusCode).send(serviceResponse);
    }
  }
);

// Get transcription info endpoint
transcriptionRouter.get("/info", (req: Request, res: Response) => {
  const serviceResponse = ServiceResponse.success(
    "Transcription endpoints available",
    {
      endpoints: [
        {
          method: "POST",
          path: "/transcription/transcribe",
          description: "Upload audio file for transcription",
          field: "audio",
          maxSize: "50MB",
          supportedFormats: [
            "MP3",
            "WAV",
            "M4A",
            "AAC",
            "OGG",
            "WebM",
            "FLAC",
            "3GPP",
            "AMR",
            "WMA",
          ],
          response: {
            audioFile:
              "object - File metadata (filename, originalName, size, mimetype, path)",
          },
        },
      ],
    }
  );

  res.status(serviceResponse.statusCode).send(serviceResponse);
});
