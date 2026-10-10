import { ThoughtTable } from "../../schema.root";
import { type DB } from "../../utils/initialize/getOPDatabase";

export const getAllThoughtsQuery = async (db: DB) => {
  try {
    return await db
      .select({
        thoughtId: ThoughtTable.id,
        noteId: ThoughtTable.noteId,
        title: ThoughtTable.title,
        type: ThoughtTable.type,
        contentId: ThoughtTable.contentId,
        createdAt: ThoughtTable.createdAt,
      })
      .from(ThoughtTable);
  } catch (error) {
    console.error(error);
  }
};
