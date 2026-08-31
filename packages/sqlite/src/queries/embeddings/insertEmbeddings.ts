import { generateID } from "../../utils/generareID";
import { EmbeddingTable } from "../../schema.root";
import { DB } from "../../utils/initialize/getOPDatabase";
import { Embedding } from "../../../../zod-schemas/src/schemas";

export const insertEmbeddingsQuery = async (db: DB, data: Embedding[]) => {
  for (const { thoughtId, embedding } of data) {
    if (!embedding) continue;
    const floatArray = new Float32Array(embedding);
    await db.insert(EmbeddingTable).values({
      id: generateID(),
      thoughtId,
      embedding: floatArray,
      status: "completed",
    });
  }
};
