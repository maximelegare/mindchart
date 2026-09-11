import { generateID } from "../../utils/generareID";
import { EmbeddingTable } from "../../schema.root";
import { DB } from "../../utils/initialize/getOPDatabase";
import { Thought } from "@repo/zod-schemas";
// import { generateID } from '@/utils/generateId.ts';

export const insertPendingEmbeddingsQuery = async (
  db: DB,
  data: Array<Thought>
) => {
  return db.transaction(async (tx) => {
    try {
      await Promise.all(
        data.map(({ id: thoughtId }) => {
          const id = generateID();
          return tx.insert(EmbeddingTable).values({
            id,
            thoughtId,
          });
        })
      );
    } catch (error) {
      console.error(error);
      throw error;
    }
  });
};
