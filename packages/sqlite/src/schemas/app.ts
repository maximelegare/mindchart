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
      columns: [thought.noteId],
      foreignColumns: [NoteTable.id],
    }),
    foreignKey({
      columns: [thought.categoryId],
      foreignColumns: [CategoryTable.id],
    }),
  ]
);

export const NoteTable = sqliteTable("note", {
  id: text("id").notNull().primaryKey(),
  title: text("title"),
  summary: text("summary"),
  createdAt: text("created_at")
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
});

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
      columns: [embedding.thoughtId],
      foreignColumns: [ThoughtTable.id],
    }),
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

export const SettingTable = sqliteTable("setting", {
  id: text("id").notNull().primaryKey(),
  name: text("name").notNull(),
  data: text("data").notNull(),
});
