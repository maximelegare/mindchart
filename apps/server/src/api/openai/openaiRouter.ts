import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import express, { NextFunction, Request, Response, type Router } from "express";
import { z } from "zod";

import { ServerOpenAIRoutes } from "@repo/constants";

import { createApiResponse } from "@/api-docs/openAPIResponseBuilders";

import { uploadSingleAudio } from "@/common/middleware/fileUpload";
import { openaiController } from "./openaiController";
// import { validateRequest } from "@/common/utils/httpHandlers";
// import { GenerateEmbeddingsSchema } from "./openaiModel";

export const openaiRegistry = new OpenAPIRegistry();
export const openaiRouter: Router = express.Router();

openaiRegistry.registerPath({
  method: "get",
  path: "/openai",
  tags: ["Open AI"],
  responses: createApiResponse(z.null(), "Success"),
});
const {
  generateNote,
  // generateEmbeddings
} = openaiController();

// openaiRouter.post(ServerOpenAIRoutes.generateNote, uploadSingleAudio("audio"),
// //  validateRequest(GenerateNoteSchema),
//   generateNote);

// Audio transcription endpoint
openaiRouter.post(
  ServerOpenAIRoutes.generateNote,
  uploadSingleAudio("file"),
  async (req: Request, res: Response, next: NextFunction) => {
    // validateRequest(GenerateNoteSchema)(req, res, next);
    return generateNote(req, res, next);
  }
);

// openaiRouter.post(ServerOpenAIRoutes.generateEmbeddings,  (req: Request, res: Response) => {
//     // validateRequest(GenerateEmbeddingsSchema)(req, res, next);
//     // return generateEmbeddings(req, res);
// });
