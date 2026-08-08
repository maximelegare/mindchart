// @ts-nocheck

import { NoteTable } from "../../schema.root";
import { DB } from "../../utils/initialize/getOPDatabase";
import { Note } from "@repo/zod-schemas/src/schemas";

export const insertNoteQuery = async (db: DB, data: Note) => {
  try {
    return await db.insert(NoteTable).values({
      id: data.id,
      title: data.title,
      // Store plain text — historically this used JSON.stringify for array summaries.
      summary:
        typeof data.summary === "string"
          ? data.summary
          : JSON.stringify(data.summary ?? ""),
      rawText: data.rawText ?? "",
      topicId: data.topicId,
      folderId: data.folderId ?? null,
      feeling: data.feeling ?? null,
      locationId: data.locationId ?? null,
      createdAt: data.createdAt ?? new Date().toISOString(),
    });
  } catch (error) {
    console.error(error);
    throw error;
  }
};
