import { DB } from "../../utils/initialize/getOPDatabase";

import type {
  Embedding,
  Folder,
  Note,
  Thought,
} from "../../../../zod-schemas/src/schemas";
import { insertNoteQuery } from "../notes/insertNote";
import { insertThoughtsQuery } from "../thoughts/insertThoughts";
import { insertEmbeddingsQuery } from "../embeddings/insertEmbeddings";
import { insertFoldersQuery } from "../folders/insertFolders";

export async function seedDatabaseQuery(
  db: DB,
  data: {
    notes: Note[];
    thoughts: Thought[];
    embeddings: Embedding[];
    folders: Folder[];
  }
) {
  await db.transaction(async (tx) => {
    try {
      await insertFoldersQuery(tx, data.folders);

      for (const note of data.notes) {
        await insertNoteQuery(tx, note);
      }

      await insertThoughtsQuery(tx, data.thoughts);

      await insertEmbeddingsQuery(tx, data.embeddings);
    } catch (error) {
      console.error(error);
      throw error; // IMPORTANT → rollback
    }
  });
}
