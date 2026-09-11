import { NoteTable } from "../../schema.root";
import { DB } from "../../utils/initialize/getOPDatabase";
import { Note } from "@repo/zod-schemas";
import { eq } from "drizzle-orm";

export const updateNoteQuery = async (db: DB, data: Note) => {
  try {
    return await db
      .update(NoteTable)
      .set({
        title: data.title,
        summary:
          typeof data.summary === "string"
            ? data.summary
            : JSON.stringify(data.summary ?? ""),
        rawText: data.rawText,
        folderId: data.folderId ?? null,
        feeling: data.feeling ?? null,
        locationId: data.locationId ?? null,
        showTitles: data.showTitles ?? false,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(NoteTable.id, data.id));
  } catch (error) {
    console.error(error);
    throw error;
  }
};
