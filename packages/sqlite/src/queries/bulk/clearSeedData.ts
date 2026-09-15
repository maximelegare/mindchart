import { like, sql } from "drizzle-orm";
import { FolderTable, NoteTable } from "../../schema.root";
import {
  DB,
  runRawSqliteTransaction,
} from "../../utils/initialize/getOPDatabase";

/**
 * Removes notes (and cascaded thoughts / embeddings) plus nested folders.
 * Root folders (`/{id}`) are kept.
 */
export async function clearSeedDataQuery(db: DB) {
  await runRawSqliteTransaction(async () => {
    await db.run(sql`DELETE FROM thought_fts`);
    await db.delete(NoteTable);
    await db.delete(FolderTable).where(like(FolderTable.path, "/%/%"));
  });
}
