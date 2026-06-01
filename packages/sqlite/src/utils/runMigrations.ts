import { migrate } from "drizzle-orm/op-sqlite/migrator";
import { sql } from "drizzle-orm";
import migrations from "../migrations/migrations";
import { getOPDatabase } from "./initialize/getOPDatabase";
import { setupDB } from "./initialize/setupDB";

/**
 * Plain-async equivalent of `useMigrationHelper`. Runs Drizzle migrations,
 * the FTS5 virtual table, and the default-data seed against whichever DB
 * the singleton currently points at. Idempotent — safe to call repeatedly.
 */
export const runMigrations = async (): Promise<void> => {
  const db = getOPDatabase();

  await migrate(db, migrations);

  await setupDB();

  await db.run(sql`
    CREATE VIRTUAL TABLE IF NOT EXISTS thought_fts USING fts5(
      id UNINDEXED,
      title,
      summary,
      semantic_label
    );
  `);
};
