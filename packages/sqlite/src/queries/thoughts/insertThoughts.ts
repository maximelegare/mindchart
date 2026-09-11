import { sql } from "drizzle-orm";
import { Thought } from "@repo/zod-schemas";
import { DB } from "../../utils/initialize/getOPDatabase";
import { ThoughtTable } from "../../schema.root";

export const insertThoughtsQuery = async (db: DB, data: Thought[]) => {
  for (const thought of data) {
    await db.insert(ThoughtTable).values({
      id: thought.id,
      noteId: thought.noteId,
      categoryId: thought.categoryId,
      semanticLabel: thought.semanticLabel,
      title: thought.title,
      summary: thought.summary,
      isCompletable: thought.isCompletable ?? false,
      isCompleted: thought.isCompleted ?? false,
      createdAt: thought.createdAt ?? new Date().toISOString(),
    });

    await db.run(sql`
      INSERT INTO thought_fts (id, title, summary, semantic_label)
      VALUES (
        ${thought.id},
        ${thought.title},
        ${thought.summary},
        ${thought.semanticLabel}
      )
    `);
  }
};
