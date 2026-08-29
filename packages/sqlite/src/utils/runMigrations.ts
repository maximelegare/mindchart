import { sql } from "drizzle-orm";
import migrations from "../migrations/migrations";
import {
  getOPDatabase,
  setForeignKeysEnabled,
} from "./initialize/getOPDatabase";
import { setupDB } from "./initialize/setupDB";

const FK_PRAGMA = /^\s*PRAGMA\s+foreign_keys\s*=/i;

type MigrationBundle = {
  journal: {
    entries: Array<{
      idx: number;
      when: number;
      tag: string;
    }>;
  };
  migrations: Record<string, string>;
};

/**
 * Apply Drizzle SQL migrations without using drizzle-orm's migrator.
 *
 * The stock OP SQLite migrator wraps everything in a transaction but does not
 * await the async callback before COMMIT. Combined with `PRAGMA foreign_keys`
 * being a no-op inside a transaction (and later migrations turning FKs back
 * ON in autocommit), that races and fails on a fresh workspace.
 */
const applySqlMigrations = async () => {
  const db = getOPDatabase();
  const bundle = migrations as MigrationBundle;

  await db.run(sql`
    CREATE TABLE IF NOT EXISTS __drizzle_migrations (
      id SERIAL PRIMARY KEY,
      hash text NOT NULL,
      created_at numeric
    )
  `);

  const applied = await db.values<[number, string, number]>(sql`
    SELECT id, hash, created_at FROM __drizzle_migrations
    ORDER BY created_at DESC LIMIT 1
  `);
  const lastAppliedAt = applied[0] ? Number(applied[0][2]) : 0;

  setForeignKeysEnabled(false);
  try {
    for (const entry of bundle.journal.entries) {
      if (lastAppliedAt && lastAppliedAt >= entry.when) continue;

      const key = `m${entry.idx.toString().padStart(4, "0")}`;
      const sqlText = bundle.migrations[key];
      if (!sqlText) {
        throw new Error(`Missing migration: ${entry.tag}`);
      }

      const statements = sqlText
        .split("--> statement-breakpoint")
        .map((stmt) => stmt.trim())
        .filter((stmt) => stmt.length > 0 && !FK_PRAGMA.test(stmt));

      for (const statement of statements) {
        try {
          await db.run(sql.raw(statement));
        } catch (error) {
          console.error(
            `Migration ${entry.tag} failed on statement:`,
            statement.slice(0, 200),
            error
          );
          throw error;
        }
      }

      await db.run(
        sql`INSERT INTO __drizzle_migrations ("hash", "created_at") VALUES (${""}, ${entry.when})`
      );
    }
  } finally {
    setForeignKeysEnabled(true);
  }
};

/**
 * Plain-async equivalent of `useMigrationHelper`. Runs SQL migrations,
 * the FTS5 virtual table, and the default-data seed against whichever DB
 * the singleton currently points at. Idempotent — safe to call repeatedly.
 */
export const runMigrations = async (): Promise<void> => {
  const db = getOPDatabase();

  await applySqlMigrations();
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
