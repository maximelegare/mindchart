import { ThoughtTable } from "../../schema.root";
import { DB } from "../../utils/initialize/getOPDatabase";
import { inArray } from "drizzle-orm";
import {
  deleteContentByIds,
  deleteThoughtFts,
} from "../thoughtContent/typedContent";

export const deleteThoughtsByIdsQuery = async (db: DB, ids: string[]) => {
  const validIds = Array.from(new Set(ids.filter(Boolean)));

  if (validIds.length === 0) {
    return { deletedCount: 0 };
  }

  try {
    const result = await db.transaction(async (tx) => {
      const dbTx = tx as unknown as DB;
      const existing = await tx
        .select({ id: ThoughtTable.id, contentId: ThoughtTable.contentId })
        .from(ThoughtTable)
        .where(inArray(ThoughtTable.id, validIds));

      const res = await tx
        .delete(ThoughtTable)
        .where(inArray(ThoughtTable.id, validIds))
        .returning({ id: ThoughtTable.id });

      await deleteThoughtFts(
        dbTx,
        res.map((row) => row.id)
      );
      await deleteContentByIds(
        dbTx,
        existing.map((row) => row.contentId)
      );

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
