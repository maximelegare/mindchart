import { ThoughtTable } from "../../schema.root";
import { DB } from "../../utils/initialize/getOPDatabase";
import { inArray } from "drizzle-orm";

export const deleteThoughtsByIdsQuery = async (db: DB, ids: string[]) => {
  // 1. Sanitize input (remove falsy + duplicates)
  const validIds = Array.from(new Set(ids.filter(Boolean)));

  // 2. Early exit (prevents invalid SQL like `IN ()`)
  if (validIds.length === 0) {
    return { deletedCount: 0 };
  }

  try {
    const result = await db.transaction(async (tx) => {
      const res = await tx
        .delete(ThoughtTable)
        .where(inArray(ThoughtTable.id, validIds))
        .returning({ id: ThoughtTable.id }); // ✅ works in SQLite (Drizzle)

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
