import { Thought } from "@repo/zod-schemas";
import { DB } from "../../utils/initialize/getOPDatabase";
import { ThoughtTable } from "../../schema.root";
import {
  insertThoughtFts,
  insertTypedContent,
} from "../thoughtContent/typedContent";

const thoughtRow = (thought: Thought) => ({
  id: thought.id,
  noteId: thought.noteId,
  type: thought.type,
  contentId: thought.contentId,
  title: thought.title,
  semanticLabel: thought.semanticLabel,
  categoryId: thought.categoryId,
  createdAt: thought.createdAt ?? new Date().toISOString(),
});

export const insertThoughtsQuery = async (db: DB, data: Thought[]) => {
  // Sequential on the caller connection. Nested `db.transaction` inside
  // `runRawSqliteTransaction` hits "cannot start a transaction within a
  // transaction" on OP SQLite.
  for (const thought of data) {
    await insertTypedContent(db, thought);
    await db.insert(ThoughtTable).values(thoughtRow(thought));
    await insertThoughtFts(db, thought);
  }
};
