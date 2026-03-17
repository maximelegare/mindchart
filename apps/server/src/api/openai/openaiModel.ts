import z from "zod";

export const GenerateNoteSchema = z.object({
  // Multer's File type is not available directly in zod, but we can make a custom refinement to ensure the essential properties exist
  file: z.object({
    fieldname: z.string(),
    originalname: z.string(),
    encoding: z.string(),
    mimetype: z.string(),
    buffer: z.any(), // Buffer type, could be refined further if needed
    size: z.number(),
  }),
});

export type GenerateNoteSchemaModel = z.infer<typeof GenerateNoteSchema>;

export const GenerateEmbeddingsSchema = z.object({
  thoughts: z.array(
    z.object({
      id: z.string(),
      summary: z.string(),
      thoughtId: z.string(),
    })
  ),
});

export type GenerateEmbeddingsSchemaModel = z.infer<
  typeof GenerateEmbeddingsSchema
>;
