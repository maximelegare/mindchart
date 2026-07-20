// @ts-nocheck

import { NoteTable } from "../../schema.root";
import { DB } from "../../utils/initialize/getOPDatabase";
import { Note } from "@repo/zod-schemas/src/schemas";
import { eq } from "drizzle-orm";

export const updateNoteQuery = async (db: DB, data: Note) => {
  try {
    return await db
      .update(NoteTable)
      .set({
        title: data.title,
        summary: JSON.stringify(data.summary),
        rawText: data.rawText,
        topicId: data.topicId,
      })
      .where(eq(NoteTable.id, data.id));
  } catch (error) {
    console.error(error);
  }
};
