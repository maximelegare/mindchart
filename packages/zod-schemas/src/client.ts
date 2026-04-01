import { z } from "zod";
import { NoteSchema, ThoughtSchema, TopicSchema } from "./schemas";

// Client-side API response schemas (what clients receive)
export const GenerateNoteResponseSchema = z.object({
  success: z.boolean(),
  responseObject: z.object({
    note: NoteSchema,
    thoughts: z.array(ThoughtSchema),
    topic: TopicSchema.merge(z.object({ isNew: z.boolean().optional() })),
  }),
});

export type GenerateNoteResponseSchemaModel = z.infer<
  typeof GenerateNoteResponseSchema
>;

// Other client-side schemas
export const GenerateEmbeddingsResponseSchema = z.object({
  success: z.boolean(),
  responseObject: z.object({
    embeddings: z.record(z.string(), z.array(z.number()).nullable()),
  }),
});

export const CategorySchema = z.object({
  id: z.string(),
  name: z.string(),
  createdAt: z.string(),
});

export type GenerateEmbeddingsResponseSchemaModel = z.infer<
  typeof GenerateEmbeddingsResponseSchema
>;

export const NotesJoinThoughtsPageSchema = z.object({
  note_id: z.string(),
  note_title: z.string(),
  note_summary: z.string(),
  note_created_at: z.string().nullable(),
  thoughts_json: z.string(),
});

export const NotesJoinThoughtsParsedJSONPageSchema = z.object({
  id: z.string(),
  title: z.string(),
  summary: z.string(),
  created_at: z.string().nullable(),
  thoughts: z.array(ThoughtSchema),
});

export type NotesJoinThoughtsParsedJSONPageSchemaModel = z.infer<
  typeof NotesJoinThoughtsParsedJSONPageSchema
>;

export const PendingEmbeddingSchema = z.object({
  id: z.string(),
  semanticLabel: z.string(),
  thoughtId: z.string(),
});

export const LocalAIResThoughtSchema = z.object({
  title: z.string(),
  summary: z.string(),
  category: z.string().optional(),
  semanticLabel: z.string(),
  thoughtId: z.string().optional(),
});

export const LocalAIResNoteSchema = z.object({
  topic: z.string(),
  topicId: z.string().optional(),
  title: z.string(),
  summary: z.string(),
  thoughts: z.array(LocalAIResThoughtSchema),
});

export const SeedLocalAIResNoteSchema = z.object({
  topicId: z.string(),
  title: z.string(),
  summary: z.string(),
  thoughts: z.array(LocalAIResThoughtSchema),
});

export type SeedLocalAIResNoteSchemaModel = z.infer<
  typeof SeedLocalAIResNoteSchema
>;

export type LocalAIResNoteSchemaModel = z.infer<typeof LocalAIResNoteSchema>;
export type LocalAIResThought = z.infer<typeof LocalAIResThoughtSchema>;
export type PendingEmbedding = z.infer<typeof PendingEmbeddingSchema>;
// Re-export shared schemas for convenience
export { NoteSchema, ThoughtSchema } from "./schemas";

export type {
  Note,
  Thought,
  ThoughtWithEmbedding,
  Category,
  Topic,
  Embedding,
} from "./schemas";
