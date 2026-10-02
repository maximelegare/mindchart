import { z } from "zod";
import {
  FeelingValueSchema,
  NoteSchema,
  PersonSchema,
  ThoughtSchema,
  ThoughtTypeSchema,
} from "./schemas";

// Client-side API response schemas (what clients receive)
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
  note_updated_at: z.string().nullable().optional(),
  note_last_viewed_at: z.string().nullable().optional(),
  folder_id: z.string().nullable().optional(),
  folder_label: z.string().nullable().optional(),
  thoughts_json: z.string(),
});

export const NotesJoinThoughtsParsedJSONPageSchema = z.object({
  id: z.string(),
  title: z.string(),
  summary: z.string(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
  lastViewedAt: z.string().nullable().optional(),
  rawText: z.string(),
  folderId: z.string().nullable().optional(),
  folderLabel: z.string().nullable().optional(),
  feeling: FeelingValueSchema.nullable().optional(),
  locationId: z.string().nullable().optional(),
  locationName: z.string().nullable().optional(),
  persons: z.array(PersonSchema).optional(),
  showTitles: z.boolean().optional().default(false),
  thoughts: z.array(ThoughtSchema),
});

export type NotesJoinThoughtsParsedJSONPageSchemaModel = z.infer<
  typeof NotesJoinThoughtsParsedJSONPageSchema
>;

export const CategoriesJoinThoughtsPageSchema = z.object({
  category_id: z.string(),
  category_name: z.string(),
  category_color: z.string(),
  category_created_at: z.string(),
  thoughts_json: z.string(),
});

export const CategoriesJoinThoughtsParsedSchema = z.object({
  id: z.string(),
  name: z.string(),
  color: z.string(),
  createdAt: z.string().optional(),
  thoughts: z.array(ThoughtSchema),
});

export type CategoriesJoinThoughtsParsedSchemaModel = z.infer<
  typeof CategoriesJoinThoughtsParsedSchema
>;

export const PendingEmbeddingSchema = z.object({
  id: z.string(),
  semanticLabel: z.string(),
  text: z.string().optional(),
  thoughtId: z.string(),
});

export const LocalAIResThoughtSchema = z.object({
  title: z.string().default(""),
  summary: z.string().default(""),
  type: ThoughtTypeSchema.optional(),
  content: z
    .object({
      text: z.string().optional(),
      checked: z.boolean().optional(),
    })
    .optional(),
  category: z.string().optional(),
  semanticLabel: z.string().default(""),
  thoughtId: z.string().optional(),
});

export const LocalAIResNoteSchema = z.object({
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
  transcriptSnippet: z.string().optional().default(""),
});

export const SearchResultsSchema = z.array(SearchResultItemSchema);

export const PaginatedSearchResultsSchema = z.object({
  items: SearchResultsSchema,
  totalCount: z.number(),
});

export type SearchResultsSchemaModel = z.infer<typeof SearchResultsSchema>;
export type SearchResultItemSchemaModel = z.infer<
  typeof SearchResultItemSchema
>;
export type PaginatedSearchResultsSchemaModel = z.infer<
  typeof PaginatedSearchResultsSchema
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
  ThoughtWithEmbeddingSchema,
  ThoughtTypeSchema,
  assembleThought,
  getThoughtPlainText,
  parseNlpMetadataSource,
  parseTextContentStyle,
  THOUGHT_TYPES,
  TEXT_CONTENT_STYLES,
  CategorySchema,
  CategoryTranslationSchema,
  CategoryWithThoughtsInfosSchema,
  FolderSchema,
  PersonSchema,
  FeelingSchema,
  FeelingValueSchema,
  LocationSchema,
  EmbeddingSchema,
} from "./schemas";

export type {
  Note,
  Thought,
  ThoughtType,
  NlpMetadataSource,
  TextContentStyle,
  ThoughtWithEmbedding,
  Category,
  CategoryTranslation,
  CategoryWithThoughtsInfos,
  Person,
  Feeling,
  FeelingValue,
  Location,
  Embedding,
  Folder,
} from "./schemas";
