import { NoteTable } from "../../schema.root";
import { type DB } from "../../utils/initialize/getOPDatabase";

export const getAllNotesQuery = async (db: DB) => {
  try {
    return await db.select().from(NoteTable);
  } catch (error) {
    console.error(error);
  }
};
