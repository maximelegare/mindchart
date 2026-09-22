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

const pragmaRows = (result: { rows?: unknown }): Array<{ name?: string }> => {
  const rows = result.rows as
    | Array<{ name?: string }>
    | { _array?: Array<{ name?: string }> }
    | undefined;
  if (Array.isArray(rows)) return rows;
  if (rows && Array.isArray(rows._array)) return rows._array;
  return [];
};

const isIgnorableMigrationError = (error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  return /duplicate column name/i.test(message);
};

/**
 * Apply Drizzle SQL migrations without using drizzle-orm's migrator.
 *
 * Track each journal `when` individually. Skipping everything `<= last
 * created_at` drops later migrations when an older migrator stored
 * Date.now() instead of the journal timestamp.
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

  const appliedRows = await db.values<[number, string, number]>(sql`
    SELECT id, hash, created_at FROM __drizzle_migrations
  `);
  const appliedWhens = new Set(
    appliedRows
      .map((row) => Number(row[2]))
      .filter((when) => Number.isFinite(when))
  );
  const appliedHashes = new Set(
    appliedRows
      .map((row) => String(row[1] ?? ""))
      .filter((hash) => hash.length > 0)
  );
  const latestCreatedAt = appliedRows.reduce((max, row) => {
    const when = Number(row[2]);
    return Number.isFinite(when) && when > max ? when : max;
  }, 0);

  setForeignKeysEnabled(false);
  try {
    for (const entry of bundle.journal.entries) {
      if (appliedWhens.has(entry.when) || appliedHashes.has(entry.tag)) {
        continue;
      }
      // Older migrators stored Date.now() instead of the journal `when`.
      // That makes last-row timestamps skip 0014 — do not replay older
      // table-rebuild SQL; ensureNoteTimestampColumns patches the schema.
      if (latestCreatedAt >= entry.when) continue;

      const key = `m${entry.idx.toString().padStart(4, "0")}`;
      const sqlText = bundle.migrations[key];
      if (!sqlText || typeof sqlText !== "string") {
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
          if (isIgnorableMigrationError(error)) continue;
          console.error(
            `Migration ${entry.tag} failed on statement:`,
            statement.slice(0, 200),
            error
          );
          throw error;
        }
      }

      await db.run(
        sql`INSERT INTO __drizzle_migrations ("hash", "created_at") VALUES (${entry.tag}, ${entry.when})`
      );
      appliedWhens.add(entry.when);
    }
  } finally {
    setForeignKeysEnabled(true);
  }
};

const noteColumnNames = async (): Promise<Set<string>> => {
  const db = getOPDatabase();
  try {
    const rows = await db.values<[number, string]>(
      sql`PRAGMA table_info('note')`
    );
    const names = rows
      .map((row) => row[1])
      .filter(
        (name): name is string => typeof name === "string" && name.length > 0
      );
    if (names.length > 0) return new Set(names);
  } catch {
    // Fall through to db.run() — some OP SQLite builds only populate `.rows`.
  }

  const result = await db.run(sql`PRAGMA table_info('note')`);
  return new Set(
    pragmaRows(result)
      .map((row) => row.name)
      .filter((name): name is string => Boolean(name))
  );
};

/** Safety net if 0014 was skipped on an existing production database. */
const ensureNoteTimestampColumns = async () => {
  const db = getOPDatabase();
  const names = await noteColumnNames();
  const addColumn = async (statement: string) => {
    try {
      await db.run(sql.raw(statement));
    } catch (error) {
      if (!isIgnorableMigrationError(error)) throw error;
    }
  };
  if (!names.has("updated_at")) {
    await addColumn(
      "ALTER TABLE note ADD COLUMN updated_at text DEFAULT CURRENT_TIMESTAMP NOT NULL"
    );
  }
  if (!names.has("last_viewed_at")) {
    await addColumn("ALTER TABLE note ADD COLUMN last_viewed_at text");
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
  await ensureNoteTimestampColumns();
  await setupDB();

  await db.run(sql`
    CREATE VIRTUAL TABLE IF NOT EXISTS thought_fts USING fts5(
      id UNINDEXED,
      title,
      body,
      semantic_label
    );
  `);
};
