import { z } from "zod";
import {
  FeelingValueSchema,
  NoteSchema,
  PersonSchema,
  ThoughtSchema,
  TopicSchema,
} from "./schemas";

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

export type GenerateEmbeddingsResponseSchemaModel = z.infer<
  typeof GenerateEmbeddingsResponseSchema
>;

export const NotesJoinThoughtsPageSchema = z.object({
  note_id: z.string(),
  note_title: z.string(),
  note_summary: z.string(),
  note_raw_text: z.string().nullable().optional(),
  note_created_at: z.string().nullable(),
  topic_id: z.string().nullable().optional(),
  topic_name: z.string().nullable().optional(),
  folder_id: z.string().nullable().optional(),
  folder_label: z.string().nullable().optional(),
  thoughts_json: z.string(),
});

export const NotesJoinThoughtsParsedJSONPageSchema = z.object({
  id: z.string(),
  title: z.string(),
  summary: z.string(),
  createdAt: z.string().optional(),
  rawText: z.string(),
  topicId: z.string().nullable().optional(),
  topicName: z.string().nullable().optional(),
  folderId: z.string().nullable().optional(),
  folderLabel: z.string().nullable().optional(),
  feeling: FeelingValueSchema.nullable().optional(),
  persons: z.array(PersonSchema).optional(),
  thoughts: z.array(ThoughtSchema),
});

export type NotesJoinThoughtsParsedJSONPageSchemaModel = z.infer<
  typeof NotesJoinThoughtsParsedJSONPageSchema
>;

export const TopicsJoinNotesThoughtsParsedSchema = z.object({
  id: z.string(),
  name: z.string(),
  createdAt: z.string().optional(),
  notes: z.array(NotesJoinThoughtsParsedJSONPageSchema),
});

export type TopicsJoinNotesThoughtsParsedSchemaModel = z.infer<
  typeof TopicsJoinNotesThoughtsParsedSchema
>;

export const CategoriesJoinThoughtsPageSchema = z.object({
  category_id: z.string(),
  category_name: z.string(),
  category_created_at: z.string(),
  thoughts_json: z.string(),
});

export const CategoriesJoinThoughtsParsedSchema = z.object({
  id: z.string(),
  name: z.string(),
  createdAt: z.string().optional(),
  thoughts: z.array(ThoughtSchema),
});

export type CategoriesJoinThoughtsParsedSchemaModel = z.infer<
  typeof CategoriesJoinThoughtsParsedSchema
>;

export const PendingEmbeddingSchema = z.object({
  id: z.string(),
  semanticLabel: z.string(),
  thoughtId: z.string(),
});

export const LocalAIResThoughtSchema = z.object({
  title: z.string().default(""),
  summary: z.string().default(""),
  category: z.string().optional(),
  semanticLabel: z.string().default(""),
  thoughtId: z.string().optional(),
});

export const LocalAIResNoteSchema = z.object({
  topic: z.string(),
  topicId: z.string().optional(),
  title: z.string(),
  summary: z
    .union([z.string(), z.array(z.string())])
    .transform((value) =>
      Array.isArray(value) ? value.join(" ").trim() : value
    ),
  rawText: z.string().optional(),
  thoughts: z.array(LocalAIResThoughtSchema),
});

export const SeedLocalAIResNoteSchema = z.object({
  folderId: z.string(),
  title: z.string(),
  summary: z.string(),
  thoughts: z.array(LocalAIResThoughtSchema),
});

export const SearchResultItemSchema = z.object({
  id: z.string(),
  noteId: z.string(),
  noteTitle: z.string(),
  thoughtTitle: z.string(),
  thoughtSummary: z.string(),
  categoryId: z.string(),
  createdAt: z.string(),
});

export const SearchResultsSchema = z.array(SearchResultItemSchema);

export type SearchResultsSchemaModel = z.infer<typeof SearchResultsSchema>;
export type SearchResultItemSchemaModel = z.infer<
  typeof SearchResultItemSchema
>;

export type SeedLocalAIResNoteSchemaModel = z.infer<
  typeof SeedLocalAIResNoteSchema
>;

export type LocalAIResNoteSchemaModel = z.infer<typeof LocalAIResNoteSchema>;
export type LocalAIResThought = z.infer<typeof LocalAIResThoughtSchema>;
export type PendingEmbedding = z.infer<typeof PendingEmbeddingSchema>;
// Re-export shared schemas for convenience
export {
  NoteSchema,
  ThoughtSchema,
  CategorySchema,
  FolderSchema,
  PersonSchema,
  FeelingSchema,
  FeelingValueSchema,
} from "./schemas";

export type {
  Note,
  Thought,
  ThoughtWithEmbedding,
  Category,
  Topic,
  Person,
  Feeling,
  FeelingValue,
  Embedding,
  Folder,
} from "./schemas";
