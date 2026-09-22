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

export const THOUGHT_TYPES = ["text", "li", "checkbox"] as const;
export type ThoughtType = (typeof THOUGHT_TYPES)[number];

export const ThoughtTypeSchema = z.enum(THOUGHT_TYPES);

const ThoughtJoinFieldsSchema = z.object({
  folderId: z.string().nullable().optional(),
  folderLabel: z.string().nullable().optional(),
  folderPath: z.string().nullable().optional(),
});

export const ThoughtBaseSchema = z
  .object({
    id: z.string(),
    thoughtId: z.string(),
    noteId: z.string(),
    contentId: z.string(),
    title: z.string(),
    categoryId: z.string(),
    semanticLabel: z.string(),
    createdAt: z.string().nullable(),
  })
  .merge(ThoughtJoinFieldsSchema);

export const TextThoughtContentSchema = z.object({
  text: z.string(),
});

export const ListItemThoughtContentSchema = z.object({
  text: z.string(),
});

export const CheckboxThoughtContentSchema = z.object({
  text: z.string(),
  checked: sqliteBoolean,
});

export const TextThoughtSchema = ThoughtBaseSchema.extend({
  type: z.literal("text"),
  content: TextThoughtContentSchema,
});

export const ListItemThoughtSchema = ThoughtBaseSchema.extend({
  type: z.literal("li"),
  content: ListItemThoughtContentSchema,
});

export const CheckboxThoughtSchema = ThoughtBaseSchema.extend({
  type: z.literal("checkbox"),
  content: CheckboxThoughtContentSchema,
});

export const ThoughtSchema = z.discriminatedUnion("type", [
  TextThoughtSchema,
  ListItemThoughtSchema,
  CheckboxThoughtSchema,
]);

export type TextThought = z.infer<typeof TextThoughtSchema>;
export type ListItemThought = z.infer<typeof ListItemThoughtSchema>;
export type CheckboxThought = z.infer<typeof CheckboxThoughtSchema>;
export type ThoughtContent =
  | z.infer<typeof TextThoughtContentSchema>
  | z.infer<typeof ListItemThoughtContentSchema>
  | z.infer<typeof CheckboxThoughtContentSchema>;

export const getThoughtPlainText = (thought: {
  content: { text?: string };
}): string => thought.content.text ?? "";

type LooseThoughtRecord = Record<string, unknown> & {
  content?: { text?: unknown; checked?: unknown } | null;
};

const asString = (value: unknown, fallback = ""): string =>
  typeof value === "string" ? value : value == null ? fallback : String(value);

export const assembleThought = (raw: LooseThoughtRecord): Thought => {
  const nested =
    raw.content && typeof raw.content === "object" ? raw.content : {};
  const type: ThoughtType =
    raw.type === "text" || raw.type === "li" || raw.type === "checkbox"
      ? raw.type
      : raw.isCompletable
        ? "checkbox"
        : "li";
  const text = asString(nested.text ?? raw.contentText ?? raw.summary ?? "");
  const id = asString(raw.id ?? raw.thoughtId);
  const base = {
    id,
    thoughtId: asString(raw.thoughtId ?? id),
    noteId: asString(raw.noteId),
    contentId: asString(raw.contentId ?? ""),
    title: asString(raw.title),
    categoryId: asString(raw.categoryId, "uncategorized") || "uncategorized",
    semanticLabel: asString(raw.semanticLabel),
    createdAt:
      raw.createdAt == null || raw.createdAt === ""
        ? null
        : asString(raw.createdAt),
    folderId: (raw.folderId as string | null | undefined) ?? undefined,
    folderLabel: (raw.folderLabel as string | null | undefined) ?? undefined,
    folderPath: (raw.folderPath as string | null | undefined) ?? undefined,
  };

  if (type === "checkbox") {
    return {
      ...base,
      type,
      content: {
        text,
        checked: Boolean(nested.checked ?? raw.checked ?? raw.isCompleted),
      },
    };
  }

  if (type === "text") {
    return { ...base, type, content: { text } };
  }

  return { ...base, type: "li", content: { text } };
};

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
  showTitles: sqliteBoolean.optional(),
});

export const ThoughtWithEmbeddingSchema = ThoughtSchema.and(
  z.object({
    embedding: z.custom<Float32Array>().nullable(),
  })
);

export const FolderSchema = z.object({
  id: z.string(),
  path: z.string(),
  label: z.string(),
  createdAt: z.string().optional(),
});

export type Folder = z.infer<typeof FolderSchema>;
