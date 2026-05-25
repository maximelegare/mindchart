import { sql } from "drizzle-orm";
import { Thought } from "@repo/zod-schemas/src/schemas";
import { DB } from "../../utils/initialize/getOPDatabase";
import { ThoughtTable } from "../../schema.root";

export const insertThoughtsQuery = async (db: DB, data: Thought[]) =>
  db.transaction(async (tx) => {
    try {
      for (const thought of data) {
        await tx.insert(ThoughtTable).values({
          id: thought.id,
          noteId: thought.noteId,
          categoryId: thought.categoryId,
          semanticLabel: thought.semanticLabel,
          title: thought.title,
          summary: thought.summary,
          createdAt: thought.createdAt ?? new Date().toISOString(),
        });

        await tx.run(sql`
          INSERT INTO thought_fts (id, title, summary, semantic_label)
          VALUES (
            ${thought.id},
            ${thought.title},
            ${thought.summary},
            ${thought.semanticLabel}
          )
        `);
      }
    } catch (error) {
      console.error(error);
      throw error;
    }
  });
