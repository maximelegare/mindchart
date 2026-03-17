// MindChart – Copyright (C) 2007-2026 Maxime Legare
// Licensed under GNU AGPL v3 + Commercial Use Restrictions
// You may not use the name "MindChart" for derivative or competing products.
// See LICENSE.md for full license and terms.

import cors from "cors";
import express, { type Express } from "express";
import helmet from "helmet";
import { pino } from "pino";
import { healthCheckRouter } from "@/api/healthCheck/healthCheckRouter";
import { userRouter } from "@/api/user/userRouter";
import { openAPIRouter } from "@/api-docs/openAPIRouter";
import errorHandler from "@/common/middleware/errorHandler";
import { handleUploadError } from "@/common/middleware/fileUpload";
import rateLimiter from "@/common/middleware/rateLimiter";
import requestLogger from "@/common/middleware/requestLogger";
import { env } from "@/common/utils/envConfig";
import { openaiRouter } from "./api/openai/openaiRouter";
import { uploadRouter } from "./api/upload/uploadRouter";
import { transcriptionRouter } from "./api/transcription/transcriptionRouter";

const logger = pino({ name: "server start" });
const app: Express = express();

// Set the application to trust the reverse proxy
app.set("trust proxy", true);

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({ origin: env.CORS_ORIGIN, credentials: true }));
app.use(helmet());
app.use(rateLimiter);

// Request logging
app.use(requestLogger);

// Routes
app.use("/health-check", healthCheckRouter);
app.use("/users", userRouter);
app.use("/openai", openaiRouter);
app.use("/upload", uploadRouter);
app.use("/transcription", transcriptionRouter);

// Swagger UI
app.use(openAPIRouter);

// Error handlers
app.use(handleUploadError);
app.use(errorHandler());

export { app, logger };
