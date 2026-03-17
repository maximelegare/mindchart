import { Thought } from "@repo/zod-schemas/src/schemas";
import { DB } from "../../utils/initialize/getOPDatabase";
import { ThoughtTable } from "../../schema.root";

export const insertThoughtsQuery = async (db: DB, data: Array<Thought>) =>
  db.transaction(async (tx) => {
    try {
      await Promise.all(
        data.map((thought) =>
          tx.insert(ThoughtTable).values({
            id: thought.id,
            noteId: thought.noteId,
            categoryId: thought.categoryId,
            semanticLabel: thought.semanticLabel,
            title: thought.title,
            summary: thought.summary,
            createdAt: thought.createdAt ?? new Date().toISOString(),
          })
        )
      );
    } catch (error) {
      console.error(error);
      throw error;
    }
  });
