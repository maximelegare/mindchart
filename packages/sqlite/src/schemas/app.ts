import { sql } from "drizzle-orm";
import {
  sqliteTable,
  text,
  foreignKey,
  integer,
  primaryKey,
} from "drizzle-orm/sqlite-core";
import { float32ArrayBlob } from "./fields/embeddingTable";

export const FolderTable = sqliteTable("folder", {
  id: text("id").notNull().primaryKey(),
  path: text("path").notNull().unique(),
  label: text("label").notNull(),
  createdAt: text("created_at")
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
});

export const ContentTable = sqliteTable("content", {
  id: text("id").notNull().primaryKey(),
  type: text("type").notNull(),
});

export const TextContentTable = sqliteTable(
  "text_content",
  {
    id: text("id").notNull().primaryKey(),
    text: text("text").notNull().default(""),
    style: text("style").notNull().default("block"),
  },
  (table) => [
    foreignKey({
      name: "text_content_id_content_id_fk",
      columns: [table.id],
      foreignColumns: [ContentTable.id],
    }).onDelete("cascade"),
  ]
);

export const ListItemContentTable = sqliteTable(
  "list_item_content",
  {
    id: text("id").notNull().primaryKey(),
    text: text("text").notNull().default(""),
  },
  (table) => [
    foreignKey({
      name: "list_item_content_id_content_id_fk",
      columns: [table.id],
      foreignColumns: [ContentTable.id],
    }).onDelete("cascade"),
  ]
);

export const CheckboxContentTable = sqliteTable(
  "checkbox_content",
  {
    id: text("id").notNull().primaryKey(),
    text: text("text").notNull().default(""),
    checked: integer("checked", { mode: "boolean" }).notNull().default(false),
  },
  (table) => [
    foreignKey({
      name: "checkbox_content_id_content_id_fk",
      columns: [table.id],
      foreignColumns: [ContentTable.id],
    }).onDelete("cascade"),
  ]
);

export const ThoughtTable = sqliteTable(
  "thought",
  {
    id: text("id").notNull().primaryKey(),
    noteId: text("note_id").notNull(),
    type: text("type").notNull(),
    contentId: text("content_id").notNull(),
    title: text("title"),
    semanticLabel: text("semantic_label"),
    categoryId: text("category_id").notNull().default("uncategorized"),
    nlpSourceHash: text("nlp_source_hash"),
    titleSource: text("title_source").notNull().default("generated"),
    categorySource: text("category_source").notNull().default("generated"),
    nlpStructureLocked: integer("nlp_structure_locked", {
      mode: "boolean",
    })
      .notNull()
      .default(false),
    nlpStructureSourceHash: text("nlp_structure_source_hash"),
    nlpStructureAnchor: float32ArrayBlob("nlp_structure_anchor"),
    position: integer("position").notNull().default(0),
    createdAt: text("created_at")
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
  },
  (thought) => [
    foreignKey({
      name: "thought_note_id_note_id_fk",
      columns: [thought.noteId],
      foreignColumns: [NoteTable.id],
    }).onDelete("cascade"),
    foreignKey({
      name: "thought_category_id_category_id_fk",
      columns: [thought.categoryId],
      foreignColumns: [CategoryTable.id],
    }),
    foreignKey({
      name: "thought_content_id_content_id_fk",
      columns: [thought.contentId],
      foreignColumns: [ContentTable.id],
    }),
  ]
);

export const FeelingTable = sqliteTable("feeling", {
  value: integer("value").notNull().primaryKey(),
  label: text("label").notNull(),
});

export const LocationTable = sqliteTable("location", {
  id: text("id").notNull().primaryKey(),
  name: text("name").notNull().unique(),
  createdAt: text("created_at")
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
});

export const NoteTable = sqliteTable(
  "note",
  {
    id: text("id").notNull().primaryKey(),
    title: text("title"),
    summary: text("summary"),
    rawText: text("raw_text"),
    folderId: text("folder_id"),
    feeling: integer("feeling"),
    locationId: text("location_id"),
    createdAt: text("created_at")
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: text("updated_at")
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    lastViewedAt: text("last_viewed_at"),
    showTitles: integer("show_titles", { mode: "boolean" })
      .notNull()
      .default(false),
  },
  (note) => [
    foreignKey({
      columns: [note.folderId],
      foreignColumns: [FolderTable.id],
    }).onDelete("set null"),
    foreignKey({
      columns: [note.feeling],
      foreignColumns: [FeelingTable.value],
    }).onDelete("set null"),
    foreignKey({
      columns: [note.locationId],
      foreignColumns: [LocationTable.id],
    }).onDelete("set null"),
  ]
);

export const EmbeddingTable = sqliteTable(
  "embedding",
  {
    id: text("id").notNull().primaryKey(),
    embedding: float32ArrayBlob("embedding"),
    thoughtId: text("thought_id").notNull(),
    status: text("status").default("pending"),
    createdAt: text("created_at")
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
  },
  (embedding) => [
    foreignKey({
      name: "embedding_thought_id_thought_id_fk",
      columns: [embedding.thoughtId],
      foreignColumns: [ThoughtTable.id],
    }).onDelete("cascade"),
  ]
);

export const AppDataTable = sqliteTable("app_data", {
  id: text("id").notNull().primaryKey(),
  name: text("name").notNull(),
  migrate: integer({ mode: "boolean" }),
  data: text("data").notNull(),
  createdAt: text("created_at")
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
});

export const CategoryTable = sqliteTable("category", {
  id: text("id").notNull().primaryKey(),
  name: text("name").notNull(),
  color: text("color").notNull(),
  createdAt: text("created_at")
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
});

export const CategoryTranslationTable = sqliteTable(
  "category_translation",
  {
    id: text("id").notNull(),
    lang: text("lang").notNull(),
    label: text("label").notNull(),
    createdAt: text("created_at")
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    editedAt: text("edited_at"),
  },
  (table) => [
    primaryKey({ columns: [table.id, table.lang] }),
    foreignKey({
      name: "category_translation_category_id_fk",
      columns: [table.id],
      foreignColumns: [CategoryTable.id],
    }).onDelete("cascade"),
  ]
);

export const SettingTable = sqliteTable("setting", {
  id: text("id").notNull().primaryKey(),
  name: text("name").notNull(),
  data: text("data").notNull(),
});

export const PersonTable = sqliteTable("person", {
  id: text("id").notNull().primaryKey(),
  name: text("name").notNull(),
  contactId: text("contact_id").unique(),
  phone: text("phone"),
  email: text("email"),
  createdAt: text("created_at")
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
});

export const PersonToNoteTable = sqliteTable(
  "person_to_note",
  {
    personId: text("person_id").notNull(),
    noteId: text("note_id").notNull(),
    createdAt: text("created_at")
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
  },
  (table) => [
    primaryKey({ columns: [table.personId, table.noteId] }),
    foreignKey({
      name: "person_to_note_person_id_fk",
      columns: [table.personId],
      foreignColumns: [PersonTable.id],
    }).onDelete("cascade"),
    foreignKey({
      name: "person_to_note_note_id_fk",
      columns: [table.noteId],
      foreignColumns: [NoteTable.id],
    }).onDelete("cascade"),
  ]
);
