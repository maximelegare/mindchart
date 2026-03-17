import express, { type Request, type Response, type Router } from "express";
import {
  uploadSingle,
  uploadMultiple,
  uploadFields,
} from "@/common/middleware/fileUpload";
import { ServiceResponse } from "@/common/models/serviceResponse";

export const uploadRouter: Router = express.Router();

// Single file upload endpoint
uploadRouter.post(
  "/single",
  uploadSingle("file"),
  (req: Request, res: Response) => {
    try {
      if (!req.file) {
        const serviceResponse = ServiceResponse.failure(
          "No file uploaded",
          null,
          400
        );
        return res.status(serviceResponse.statusCode).send(serviceResponse);
      }

      const serviceResponse = ServiceResponse.success(
        "File uploaded successfully",
        {
          filename: req.file.filename,
          originalName: req.file.originalname,
          size: req.file.size,
          mimetype: req.file.mimetype,
          path: req.file.path,
        }
      );

      res.status(serviceResponse.statusCode).send(serviceResponse);
    } catch {
      const serviceResponse = ServiceResponse.failure(
        "File upload failed",
        null,
        500
      );
      res.status(serviceResponse.statusCode).send(serviceResponse);
    }
  }
);

// Multiple files upload endpoint
uploadRouter.post(
  "/multiple",
  uploadMultiple("files", 5),
  (req: Request, res: Response) => {
    try {
      if (!req.files || (Array.isArray(req.files) && req.files.length === 0)) {
        const serviceResponse = ServiceResponse.failure(
          "No files uploaded",
          null,
          400
        );
        return res.status(serviceResponse.statusCode).send(serviceResponse);
      }

      const files = Array.isArray(req.files)
        ? req.files
        : Object.values(req.files).flat();

      const serviceResponse = ServiceResponse.success(
        "Files uploaded successfully",
        {
          count: files.length,
          files: files.map((file) => ({
            filename: file.filename,
            originalName: file.originalname,
            size: file.size,
            mimetype: file.mimetype,
            path: file.path,
          })),
        }
      );

      res.status(serviceResponse.statusCode).send(serviceResponse);
    } catch {
      const serviceResponse = ServiceResponse.failure(
        "Files upload failed",
        null,
        500
      );
      res.status(serviceResponse.statusCode).send(serviceResponse);
    }
  }
);

// Multiple fields upload endpoint (e.g., avatar + documents)
uploadRouter.post(
  "/fields",
  uploadFields([
    { name: "avatar", maxCount: 1 },
    { name: "documents", maxCount: 3 },
  ]),
  (req: Request, res: Response) => {
    try {
      const files = req.files as { [fieldname: string]: Express.Multer.File[] };

      if (!files || Object.keys(files).length === 0) {
        const serviceResponse = ServiceResponse.failure(
          "No files uploaded",
          null,
          400
        );
        return res.status(serviceResponse.statusCode).send(serviceResponse);
      }

      const serviceResponse = ServiceResponse.success(
        "Files uploaded successfully",
        {
          fields: Object.entries(files).map(([fieldName, fileArray]) => ({
            fieldName,
            count: fileArray.length,
            files: fileArray.map((file) => ({
              filename: file.filename,
              originalName: file.originalname,
              size: file.size,
              mimetype: file.mimetype,
              path: file.path,
            })),
          })),
        }
      );

      res.status(serviceResponse.statusCode).send(serviceResponse);
    } catch {
      const serviceResponse = ServiceResponse.failure(
        "Files upload failed",
        null,
        500
      );
      res.status(serviceResponse.statusCode).send(serviceResponse);
    }
  }
);

// Get upload info endpoint
uploadRouter.get("/info", (req: Request, res: Response) => {
  const serviceResponse = ServiceResponse.success(
    "Upload endpoints available",
    {
      endpoints: [
        {
          method: "POST",
          path: "/upload/single",
          description: "Upload a single file",
          field: "file",
          maxSize: "10MB",
          allowedTypes: [
            "image/*",
            "application/pdf",
            "text/plain",
            "application/msword",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
          ],
        },
        {
          method: "POST",
          path: "/upload/multiple",
          description: "Upload multiple files",
          field: "files",
          maxFiles: 5,
          maxSize: "10MB each",
          allowedTypes: [
            "image/*",
            "application/pdf",
            "text/plain",
            "application/msword",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
          ],
        },
        {
          method: "POST",
          path: "/upload/fields",
          description: "Upload files to multiple fields",
          fields: {
            avatar: "1 file max",
            documents: "3 files max",
          },
          maxSize: "10MB each",
          allowedTypes: [
            "image/*",
            "application/pdf",
            "text/plain",
            "application/msword",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
          ],
        },
      ],
    }
  );

  res.status(serviceResponse.statusCode).send(serviceResponse);
});
