// @ts-nocheck

import { NoteTable } from "../../schema.root";
import { DB } from "../../utils/initialize/getOPDatabase";
import { Note } from "@repo/zod-schemas/src/schemas";

export const insertNoteQuery = async (db: DB, data: Note) => {
  try {
    return await db.insert(NoteTable).values({
      ...data,
      summary: JSON.stringify(data.summary),
    });
  } catch (error) {
    console.error(error);
  }
};
