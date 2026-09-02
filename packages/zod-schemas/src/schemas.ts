import { z } from "zod";

export const CategorySchema = z.object({
  id: z.string(),
  name: z.string(),
  color: z.string(),
  createdAt: z.string(),
});

export const CategoryTranslationSchema = z.object({
  id: z.string(),
  lang: z.string(),
  label: z.string(),
  createdAt: z.string(),
  editedAt: z.string().nullable().optional(),
});

export type Note = z.infer<typeof NoteSchema>;

export type Thought = z.infer<typeof ThoughtSchema>;

export type Category = z.infer<typeof CategorySchema>;

export type CategoryTranslation = z.infer<typeof CategoryTranslationSchema>;

export type Person = z.infer<typeof PersonSchema>;

export type FeelingValue = z.infer<typeof FeelingValueSchema>;

export type Feeling = z.infer<typeof FeelingSchema>;

export type Location = z.infer<typeof LocationSchema>;

export type Embedding = z.infer<typeof EmbeddingSchema>;
export type ThoughtWithEmbedding = z.infer<typeof ThoughtWithEmbeddingSchema>;

export const FeelingValueSchema = z.union([
  z.literal(-2),
  z.literal(-1),
  z.literal(0),
  z.literal(1),
  z.literal(2),
]);

export const FeelingSchema = z.object({
  value: FeelingValueSchema,
  label: z.string(),
});

export const LocationSchema = z.object({
  id: z.string(),
  name: z.string(),
  createdAt: z.string().optional(),
});

export const PersonSchema = z.object({
  id: z.string(),
  name: z.string(),
  contactId: z.string().nullable().optional(),
  createdAt: z.string().optional(),
});

export const CategoryWithThoughtsInfosSchema = CategorySchema.extend({
  thoughtCount: z.number(),
});

export type CategoryWithThoughtsInfos = z.infer<
  typeof CategoryWithThoughtsInfosSchema
>;

/** SQLite json_object emits 0/1 for boolean columns. */
const sqliteBoolean = z.preprocess(
  (value) => value === true || value === 1 || value === "1" || value === "true",
  z.boolean()
);

export const ThoughtSchema = z.object({
  id: z.string(),
  title: z.string(),
  folderId: z.string().nullable().optional(),
  folderLabel: z.string().nullable().optional(),
  folderPath: z.string().nullable().optional(),
  summary: z.string(),
  semanticLabel: z.string(),
  noteId: z.string(),
  categoryId: z.string(),
  thoughtId: z.string(),
  createdAt: z.string().nullable(),
  isCompletable: sqliteBoolean,
  isCompleted: sqliteBoolean,
});

export const EmbeddingSchema = z.object({
  id: z.string(),
  thoughtId: z.string(),
  createdAt: z.string(),
  embedding: z
    .custom<Float32Array>() // tell Zod this is a Float32Array
    .nullable(),
});

export const NoteSchema = z.object({
  id: z.string(),
  title: z.string(),
  summary: z.string(),
  rawText: z.string().default(""),
  folderId: z.string().nullable().optional(),
  folderLabel: z.string().nullable().optional(),
  feeling: FeelingValueSchema.nullable().optional(),
  locationId: z.string().nullable().optional(),
  locationName: z.string().nullable().optional(),
  persons: z.array(PersonSchema).optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
  lastViewedAt: z.string().nullable().optional(),
});

export const ThoughtWithEmbeddingSchema = ThoughtSchema.merge(EmbeddingSchema);

export const FolderSchema = z.object({
  id: z.string(),
  path: z.string(),
  label: z.string(),
  createdAt: z.string().optional(),
});

export type Folder = z.infer<typeof FolderSchema>;
