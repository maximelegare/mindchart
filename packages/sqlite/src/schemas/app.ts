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

export const ThoughtTable = sqliteTable(
  "thought",
  {
    id: text("id").notNull().primaryKey(),
    noteId: text("note_id").notNull(),
    title: text("title"),
    summary: text("summary"),
    semanticLabel: text("semantic_label"),
    categoryId: text("category_id").notNull().default("uncategorized"),
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
