import { getOPDatabase } from "./initialize/getOPDatabase";
import { EmbeddingTable, NoteTable, ThoughtTable } from "../schema.root";

export const emptyDB = async () => {
  const db = getOPDatabase();
  db.transaction(async (tx) => {
    try {
      await tx.delete(NoteTable);
      await tx.delete(ThoughtTable);
      await tx.delete(EmbeddingTable);
      console.log("DB:emptied");
    } catch (error) {
      console.error(error);
    }
  });
};
