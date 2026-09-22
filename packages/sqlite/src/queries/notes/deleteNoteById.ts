import { eq } from "drizzle-orm";
import { NoteTable, ThoughtTable } from "../../schema.root";
import { DB } from "../../utils/initialize/getOPDatabase";
import {
  deleteContentByIds,
  deleteThoughtFts,
} from "../thoughtContent/typedContent";

export const deleteNoteByIdQuery = async (db: DB, noteId: string) => {
  return await db.transaction(async (tx) => {
    const dbTx = tx as unknown as DB;
    const thoughts = await tx
      .select({ id: ThoughtTable.id, contentId: ThoughtTable.contentId })
      .from(ThoughtTable)
      .where(eq(ThoughtTable.noteId, noteId));
    await tx.delete(NoteTable).where(eq(NoteTable.id, noteId));
    await deleteThoughtFts(
      dbTx,
      thoughts.map((thought) => thought.id)
    );
    await deleteContentByIds(
      dbTx,
      thoughts.map((thought) => thought.contentId)
    );
  });
};
