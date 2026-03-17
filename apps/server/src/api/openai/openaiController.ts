import type {
  Request,
  RequestHandler,
  //  Response
} from "express";
// import { ServiceResponse } from "@/common/models/serviceResponse";
// import { openaiService } from "./openaiService";

export const openaiController = () => {
  // const { generateNoteService, generateEmbeddingsService } = openaiService();

  const generateNote: RequestHandler = async (
    _req: Request
    // res: Response
  ) => {
    // Parse categories from JSON string (FormData sends it as a string)
    let categoriesString = "";
    try {
      if (_req.body.categories) {
        // If it's already a string (JSON stringified), parse it to get the array
        const parsed =
          typeof _req.body.categories === "string"
            ? JSON.parse(_req.body.categories)
            : _req.body.categories;
        // Convert array of category names to a comma-separated string for the prompt
        categoriesString = Array.isArray(parsed)
          ? parsed.join(", ")
          : String(parsed);
      }
    } catch (error) {
      console.error("Error parsing categories:", error);
      categoriesString = "";
    }

    console.log("categories2", categoriesString);
    console.log("categories raw", _req.body.categories);

    // const noteData = await generateNoteService(_req.file, {categories: categoriesString});

    // If note generation failed, return the error response
    // if (!noteData.success) {
    //   return res.status(noteData.statusCode).send(noteData);
    // }

    // // Ensure we have thoughts before generating embeddings
    // if (!noteData.responseObject?.thoughts || noteData.responseObject.thoughts.length === 0) {
    //   return res.status(noteData.statusCode).send(noteData);
    // }

    // const embeddingsData = await generateEmbeddingsService(noteData.responseObject.thoughts);

    // // If embeddings generation failed, return the error response
    // if (!embeddingsData.success) {
    //   return res.status(embeddingsData.statusCode).send(embeddingsData);
    // }

    // Create success response with merged data
    // const mergedResponse = {
    //   ...noteData.responseObject,
    //   // embeddings: embeddingsData.responseObject?.embeddings,
    // };

    // const serviceResponse = ServiceResponse.success(
    //   "Success generating the note, thoughts, and embeddings",
    //   mergedResponse,
    //   noteData.statusCode
    // );

    // res.status(serviceResponse.statusCode).send(serviceResponse);
  };

  // const generateEmbeddings = async (_req: Request, res: Response) => {
  //   const embeddingsData = await generateEmbeddingsService(_req.body);

  //   if (!embeddingsData.success) {
  //     return res.status(embeddingsData.statusCode).send(embeddingsData);
  //   }

  //   return res.status(embeddingsData.statusCode).send(embeddingsData);
  // }

  return {
    generateNote,
    // generateEmbeddings
  };
};
