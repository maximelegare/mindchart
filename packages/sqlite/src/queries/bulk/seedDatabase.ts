import {
  DB,
  runRawSqliteTransaction,
} from "../../utils/initialize/getOPDatabase";

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
  await runRawSqliteTransaction(async () => {
    await insertFoldersQuery(db, data.folders);

    for (const note of data.notes) {
      await insertNoteQuery(db, note);
    }

    await insertThoughtsQuery(db, data.thoughts);
    await insertEmbeddingsQuery(db, data.embeddings);
  });
}
