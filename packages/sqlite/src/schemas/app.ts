import { sql } from "drizzle-orm";
import {
  sqliteTable,
  text,
  foreignKey,
  blob,
  integer,
} from "drizzle-orm/sqlite-core";
import { float32ArrayBlob } from "./fields/embeddingTable";

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

export const NoteTable = sqliteTable(
  "note",
  {
    id: text("id").notNull().primaryKey(),
    title: text("title"),
    summary: text("summary"),
    rawText: text("raw_text"),
    topicId: text("topic_id"),
    createdAt: text("created_at")
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
  },
  (note) => [
    foreignKey({
      columns: [note.topicId],
      foreignColumns: [TopicTable.id],
    }).onDelete("cascade"),
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
  createdAt: text("created_at")
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
});

export const TopicTable = sqliteTable("topic", {
  id: text("id").notNull().primaryKey(),
  name: text("name").notNull(),
  embedding: float32ArrayBlob("embedding").notNull(),
  createdAt: text("created_at")
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
});

export const SettingTable = sqliteTable("setting", {
  id: text("id").notNull().primaryKey(),
  name: text("name").notNull(),
  data: text("data").notNull(),
});

export const FolderTable = sqliteTable("folder", {
  id: text("id").notNull().primaryKey(),
  path: text("path").notNull().unique(),
  label: text("label").notNull(),
  createdAt: text("created_at")
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
});
