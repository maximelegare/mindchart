import { z } from "zod";

export const CategorySchema = z.object({
  id: z.string(),
  name: z.string(),
  createdAt: z.string(),
});

export type Note = z.infer<typeof NoteSchema>;

export type Thought = z.infer<typeof ThoughtSchema>;

export type Category = z.infer<typeof CategorySchema>;

export type Topic = z.infer<typeof TopicSchema>;

export type Embedding = z.infer<typeof EmbeddingSchema>;
export type ThoughtWithEmbedding = z.infer<typeof ThoughtWithEmbeddingSchema>;

export const TopicSchema = z.object({
  id: z.string(),
  name: z.string(),
  embedding: z.custom<Float32Array>(),
  isNew: z.boolean().optional(),
  createdAt: z.string().optional(),
});

export const TopicWithNotesInfosSchema = TopicSchema.extend({
  noteCount: z.number(),
}).omit({
  embedding: true,
  isNew: true,
});

export const CategoryWithThoughtsInfosSchema = CategorySchema.extend({
  thoughtCount: z.number(),
  topicsCount: z.number(),
});

export type CategoryWithThoughtsInfos = z.infer<
  typeof CategoryWithThoughtsInfosSchema
>;

export type TopicWithNotesInfos = z.infer<typeof TopicWithNotesInfosSchema>;

export const ThoughtSchema = z.object({
  id: z.string(),
  title: z.string(),
  topicName: z.string().optional(),
  topicId: z.string().optional(),
  summary: z.string(),
  semanticLabel: z.string(),
  noteId: z.string(),
  categoryId: z.string(),
  thoughtId: z.string(),
  createdAt: z.string().nullable(),
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
  topicId: z.string().nullable().optional(),
  topicName: z.string().nullable().optional(),
  createdAt: z.string().optional(),
});

export const ThoughtWithEmbeddingSchema = ThoughtSchema.merge(EmbeddingSchema);

export const FolderSchema = z.object({
  id: z.string(),
  path: z.string(),
  label: z.string(),
  createdAt: z.string().optional(),
});

export type Folder = z.infer<typeof FolderSchema>;
