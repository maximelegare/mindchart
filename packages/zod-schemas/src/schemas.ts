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

export const HEADING_TYPES = ["h1", "h2", "h3", "h4", "h5", "h6"] as const;
export type HeadingType = (typeof HEADING_TYPES)[number];

export const THOUGHT_TYPES = [
  "text",
  "li",
  "checkbox",
  ...HEADING_TYPES,
] as const;
export type ThoughtType = (typeof THOUGHT_TYPES)[number];

export const ThoughtTypeSchema = z.enum(THOUGHT_TYPES);

export const isHeadingType = (type: unknown): type is HeadingType =>
  type === "h1" ||
  type === "h2" ||
  type === "h3" ||
  type === "h4" ||
  type === "h5" ||
  type === "h6";

export const isTextLikeType = (type: unknown): type is "text" | HeadingType =>
  type === "text" || isHeadingType(type);

export type TextLikeThought = Extract<Thought, { type: "text" | HeadingType }>;

export const isTextLikeThought = (
  thought: Thought
): thought is TextLikeThought => isTextLikeType(thought.type);

export const parseThoughtType = (value: unknown): ThoughtType => {
  if (
    value === "text" ||
    value === "li" ||
    value === "checkbox" ||
    isHeadingType(value)
  ) {
    return value;
  }
  return "li";
};

export const NLP_METADATA_SOURCES = ["generated", "user"] as const;
export type NlpMetadataSource = (typeof NLP_METADATA_SOURCES)[number];

export const parseNlpMetadataSource = (value: unknown): NlpMetadataSource =>
  value === "user" ? "user" : "generated";

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
    nlpSourceHash: z.string().optional(),
    titleSource: z.enum(NLP_METADATA_SOURCES).optional().default("generated"),
    categorySource: z
      .enum(NLP_METADATA_SOURCES)
      .optional()
      .default("generated"),
    createdAt: z.string().nullable(),
    position: z.number().int().optional(),
  })
  .merge(ThoughtJoinFieldsSchema);

export const TEXT_CONTENT_STYLES = ["block", "inline"] as const;
export type TextContentStyle = (typeof TEXT_CONTENT_STYLES)[number];

export const parseTextContentStyle = (value: unknown): TextContentStyle =>
  value === "inline" ? "inline" : "block";

export const TextThoughtContentSchema = z.object({
  text: z.string(),
  style: z.enum(TEXT_CONTENT_STYLES).optional().default("block"),
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

export const H1ThoughtSchema = ThoughtBaseSchema.extend({
  type: z.literal("h1"),
  content: TextThoughtContentSchema,
});
export const H2ThoughtSchema = ThoughtBaseSchema.extend({
  type: z.literal("h2"),
  content: TextThoughtContentSchema,
});
export const H3ThoughtSchema = ThoughtBaseSchema.extend({
  type: z.literal("h3"),
  content: TextThoughtContentSchema,
});
export const H4ThoughtSchema = ThoughtBaseSchema.extend({
  type: z.literal("h4"),
  content: TextThoughtContentSchema,
});
export const H5ThoughtSchema = ThoughtBaseSchema.extend({
  type: z.literal("h5"),
  content: TextThoughtContentSchema,
});
export const H6ThoughtSchema = ThoughtBaseSchema.extend({
  type: z.literal("h6"),
  content: TextThoughtContentSchema,
});

export const ThoughtSchema = z.discriminatedUnion("type", [
  TextThoughtSchema,
  ListItemThoughtSchema,
  CheckboxThoughtSchema,
  H1ThoughtSchema,
  H2ThoughtSchema,
  H3ThoughtSchema,
  H4ThoughtSchema,
  H5ThoughtSchema,
  H6ThoughtSchema,
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
  content?: { text?: unknown; checked?: unknown; style?: unknown } | null;
};

const asString = (value: unknown, fallback = ""): string =>
  typeof value === "string" ? value : value == null ? fallback : String(value);

export const assembleThought = (raw: LooseThoughtRecord): Thought => {
  const nested =
    raw.content && typeof raw.content === "object" ? raw.content : {};
  const type: ThoughtType = raw.isCompletable
    ? "checkbox"
    : parseThoughtType(raw.type);
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
    nlpSourceHash: asString(raw.nlpSourceHash) || undefined,
    titleSource: parseNlpMetadataSource(raw.titleSource),
    categorySource: parseNlpMetadataSource(raw.categorySource),
    createdAt:
      raw.createdAt == null || raw.createdAt === ""
        ? null
        : asString(raw.createdAt),
    folderId: (raw.folderId as string | null | undefined) ?? undefined,
    folderLabel: (raw.folderLabel as string | null | undefined) ?? undefined,
    folderPath: (raw.folderPath as string | null | undefined) ?? undefined,
    position: (() => {
      const value =
        typeof raw.position === "number"
          ? raw.position
          : typeof raw.position === "string" && raw.position.trim() !== ""
            ? Number(raw.position)
            : NaN;
      return Number.isFinite(value) ? value : undefined;
    })(),
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

  if (isTextLikeType(type)) {
    const style = parseTextContentStyle(
      nested.style ?? raw.contentStyle ?? raw.style
    );
    return { ...base, type, content: { text, style } };
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
