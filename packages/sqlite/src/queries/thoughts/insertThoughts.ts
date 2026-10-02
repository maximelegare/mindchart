import { Thought } from "@repo/zod-schemas";
import { DB } from "../../utils/initialize/getOPDatabase";
import { ThoughtTable } from "../../schema.root";
import {
  insertThoughtFts,
  insertTypedContent,
} from "../thoughtContent/typedContent";

const thoughtRow = (thought: Thought, position = 0) => ({
  id: thought.id,
  noteId: thought.noteId,
  type: thought.type,
  contentId: thought.contentId,
  title: thought.title,
  semanticLabel: thought.semanticLabel,
  nlpSourceHash: thought.nlpSourceHash ?? null,
  titleSource: thought.titleSource === "user" ? "user" : "generated",
  categorySource: thought.categorySource === "user" ? "user" : "generated",
  categoryId: thought.categoryId,
  position: thought.position ?? position,
  createdAt: thought.createdAt ?? new Date().toISOString(),
});

export const insertThoughtsQuery = async (db: DB, data: Thought[]) => {
  // Sequential on the caller connection. Nested `db.transaction` inside
  // `runRawSqliteTransaction` hits "cannot start a transaction within a
  // transaction" on OP SQLite.
  for (let index = 0; index < data.length; index++) {
    const thought = data[index];
    if (!thought) continue;
    await insertTypedContent(db, thought);
    await db.insert(ThoughtTable).values(thoughtRow(thought, index));
    await insertThoughtFts(db, thought);
  }
};
