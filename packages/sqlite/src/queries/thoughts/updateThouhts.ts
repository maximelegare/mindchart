import { Thought } from "@repo/zod-schemas/src/schemas";
import { DB } from "../../utils/initialize/getOPDatabase";
import { ThoughtTable } from "../../schema.root";
import { eq, sql } from "drizzle-orm";

export const updateThoughtsQuery = async (
  db: DB,
  data: Array<Thought & { status: "new" | "updated" }>
) => {
  const validData = Array.from(
    new Map(data.filter(Boolean).map((t) => [t.id, t])).values()
  );

  if (validData.length === 0) {
    return { inserted: 0, updated: 0 };
  }

  return db.transaction(async (tx) => {
    let inserted = 0;
    let updated = 0;

    try {
      // Split new vs updated
      const toInsert = validData.filter((t) => t.status === "new");
      const toUpdate = validData.filter((t) => t.status === "updated");

      // -----------------------------------
      // INSERTS (Thought + FTS)
      // -----------------------------------
      if (toInsert.length > 0) {
        await tx.insert(ThoughtTable).values(
          toInsert.map((thought) => ({
            id: thought.id,
            summary: thought.summary,
            title: thought.title,
            semanticLabel: thought.semanticLabel,
            categoryId: thought.categoryId,
            noteId: thought.noteId,
            isCompletable: thought.isCompletable ?? false,
            isCompleted: thought.isCompleted ?? false,
            createdAt: thought.createdAt ?? new Date().toISOString(),
          }))
        );

        // FTS sync insert
        await tx.run(sql`
          INSERT INTO thought_fts (id, title, summary, semantic_label)
          VALUES ${sql.join(
            toInsert.map(
              (t) =>
                sql`(${t.id}, ${t.title}, ${t.summary}, ${t.semanticLabel})`
            ),
            sql`, `
          )}
        `);

        inserted = toInsert.length;
      }

      // -----------------------------------
      // UPDATES (Thought + FTS)
      // -----------------------------------
      for (const thought of toUpdate) {
        await tx
          .update(ThoughtTable)
          .set({
            summary: thought.summary,
            title: thought.title,
            semanticLabel: thought.semanticLabel,
            categoryId: thought.categoryId,
            isCompletable: thought.isCompletable ?? false,
            isCompleted: thought.isCompleted ?? false,
          })
          .where(eq(ThoughtTable.id, thought.id));

        // FTS sync update
        await tx.run(sql`
          UPDATE thought_fts
          SET title = ${thought.title},
              summary = ${thought.summary},
              semantic_label = ${thought.semanticLabel}
          WHERE id = ${thought.id}
        `);

        updated++;
      }

      return {
        inserted,
        updated,
        total: inserted + updated,
      };
    } catch (error) {
      console.error("updateThoughtsQuery failed:", error);
      throw error;
    }
  });
};

export const updateThoughtCompletionQuery = async (
  db: DB,
  data: { id: string; isCompleted: boolean }
) => {
  await db
    .update(ThoughtTable)
    .set({ isCompleted: data.isCompleted })
    .where(eq(ThoughtTable.id, data.id));
};
