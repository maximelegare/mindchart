import { z } from "zod";
import { NoteSchema, ThoughtSchema, ThoughtTypeSchema } from "./schemas";

// OpenAI API response schemas (what we get from OpenAI)
export const OpenAIResThoughtSchema = z.object({
  title: z.string(),
  summary: z.string(),
  type: ThoughtTypeSchema.optional(),
  content: z
    .object({
      text: z.string().optional(),
      checked: z.boolean().optional(),
    })
    .optional(),
  category: z.string().optional(),
  thoughtId: z.string().optional(),
});

export const OpenAIResNoteSchema = z.object({
  title: z.string(),
  summary: z.array(z.string()),
  thoughts: z.array(OpenAIResThoughtSchema),
});

export type OpenAIResNote = z.infer<typeof OpenAIResNoteSchema>;
export type OpenAIResThought = z.infer<typeof OpenAIResThoughtSchema>;

// Server response schemas (what we send to clients)
export const GenerateNoteResponseSchema = z.object({
  success: z.boolean(),
  responseObject: z.object({
    note: NoteSchema,
    thoughts: z.array(ThoughtSchema),
  }),
});

export type GenerateNoteResponseSchemaModel = z.infer<
  typeof GenerateNoteResponseSchema
>;

// Re-export shared schemas for convenience
export { NoteSchema, ThoughtSchema } from "./schemas";
export type { Note, Thought } from "./schemas";
