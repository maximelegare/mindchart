import { ThoughtTable } from "../../schema.root";
import { DB } from "../../utils/initialize/getOPDatabase";
import { inArray, sql } from "drizzle-orm";

export const deleteThoughtsByIdsQuery = async (db: DB, ids: string[]) => {
  const validIds = Array.from(new Set(ids.filter(Boolean)));

  if (validIds.length === 0) {
    return { deletedCount: 0 };
  }

  try {
    const result = await db.transaction(async (tx) => {
      const res = await tx
        .delete(ThoughtTable)
        .where(inArray(ThoughtTable.id, validIds))
        .returning({ id: ThoughtTable.id });

      await tx.run(sql`
        DELETE FROM thought_fts
        WHERE id IN (${sql.join(validIds, sql`, `)})
      `);

      return res;
    });

    return {
      deletedCount: result.length,
      deletedIds: result.map((r) => r.id),
    };
  } catch (error) {
    console.error("Failed to delete thoughts:", error);
    throw error;
  }
};
