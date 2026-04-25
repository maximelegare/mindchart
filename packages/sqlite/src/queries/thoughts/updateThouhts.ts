import { Thought } from "@repo/zod-schemas/src/schemas";
import { DB } from "../../utils/initialize/getOPDatabase";
import { ThoughtTable } from "../../schema.root";
import { eq } from "drizzle-orm";

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
      // 2. Split new vs updated
      const toInsert = validData.filter((t) => t.status === "new");
      const toUpdate = validData.filter((t) => t.status === "updated");

      // 3. Batch insert (fast)
      if (toInsert.length > 0) {
        await tx.insert(ThoughtTable).values(
          toInsert.map((thought) => ({
            id: thought.id,
            summary: thought.summary,
            title: thought.title,
            semanticLabel: thought.semanticLabel,
            categoryId: thought.categoryId,
            noteId: thought.noteId,
            createdAt: thought.createdAt ?? new Date().toISOString(),
          }))
        );
        inserted = toInsert.length;
      }

      // 4. Sequential updates (safe for SQLite)
      for (const thought of toUpdate) {
        await tx
          .update(ThoughtTable)
          .set({
            summary: thought.summary,
            title: thought.title,
            semanticLabel: thought.semanticLabel,
            categoryId: thought.categoryId,
          })
          .where(eq(ThoughtTable.id, thought.id));

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
