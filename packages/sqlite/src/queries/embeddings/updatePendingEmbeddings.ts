import { EmbeddingTable } from "../../schema.root";
import { DB } from "../../utils/initialize/getOPDatabase";
import { eq } from "drizzle-orm";

import { Embedding } from "@repo/zod-schemas/src/schemas";

export const updatePendingEmbeddingsQuery = async (
  db: DB,
  data: Embedding[]
) => {
  return db.transaction(async (tx) => {
    try {
      await Promise.all(
        data.map((e) => {
          if (!e.embedding) return;
          return tx
            .update(EmbeddingTable)
            .set({ ...e })
            .where(eq(EmbeddingTable.id, e.id));
        })
      );
    } catch (error) {
      console.error(error);
      throw error;
    }
  });
};
