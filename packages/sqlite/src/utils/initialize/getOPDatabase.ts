import { open, type SQLiteDatabase } from "@op-engineering/op-sqlite";
import { drizzle, OPSQLiteDatabase } from "drizzle-orm/op-sqlite";
import * as FileSystem from "expo-file-system/legacy";
import { WorkspaceEncryptionKeyMissingError } from "./workspaceEncryptionKeyMissingError";

let instance: OPSQLiteDatabase | null = null;
let rawSqlite: SQLiteDatabase | null = null;
let activeEncryptionKey: string | null = null;

// Defaults to the legacy filename so existing installs keep working until
// a workspace pointer is set explicitly via setActiveWorkspace().
let activeDbName: string = "mindchart.db";

const dbLocation = FileSystem.documentDirectory + "databases";

export type DB = OPSQLiteDatabase;

export const setWorkspaceEncryptionKey = (key: string | null) => {
  activeEncryptionKey = key;
};

export const getOPDatabase = (): OPSQLiteDatabase => {
  if (!instance) {
    if (!activeEncryptionKey) {
      throw new WorkspaceEncryptionKeyMissingError();
    }
    rawSqlite = open({
      name: activeDbName,
      location: dbLocation,
      encryptionKey: activeEncryptionKey,
    });

    rawSqlite.executeSync("PRAGMA foreign_keys = ON;");
    instance = drizzle(rawSqlite);
  }
  return instance;
};

/**
 * Toggle FK enforcement on the raw OP SQLite connection.
 * Must not go through Drizzle: `PRAGMA foreign_keys` is a no-op inside a
 * transaction, and Drizzle wraps `db.run()` / `migrate()` in transactions.
 */
export const setForeignKeysEnabled = (enabled: boolean) => {
  getOPDatabase();
  rawSqlite?.executeSync(`PRAGMA foreign_keys = ${enabled ? "ON" : "OFF"};`);
};

export const runRawSqliteTransaction = async <T>(
  fn: () => Promise<T>
): Promise<T> => {
  getOPDatabase();
  if (!rawSqlite) {
    throw new Error("SQLite connection is not open");
  }
  rawSqlite.executeSync("BEGIN");
  try {
    const result = await fn();
    rawSqlite.executeSync("COMMIT");
    return result;
  } catch (error) {
    rawSqlite.executeSync("ROLLBACK");
    throw error;
  }
};

const closeConnection = () => {
  if (rawSqlite) {
    rawSqlite.close();
    rawSqlite = null;
    instance = null;
  }
};

/**
 * Safely closes the database and resets the instance
 */
export const closeOPDatabase = async () => {
  closeConnection();
  activeEncryptionKey = null;
};

/**
 * Returns the filename currently pointed at by the singleton (e.g. "abc-123.db").
 * The actual on-disk file lives at `${dbLocation}/${getActiveDbName()}`.
 */
export const getActiveDbName = (): string => activeDbName;

export const getDbLocation = (): string => dbLocation;

/**
 * Switch the singleton to point at a different workspace database file.
 * Closes any currently open connection so the next getOPDatabase() call
 * opens the new file. No-ops if the name is unchanged.
 */
export const setActiveWorkspace = async (dbName: string) => {
  if (!dbName) {
    throw new Error("setActiveWorkspace requires a non-empty dbName");
  }
  if (dbName === activeDbName && instance) return;
  closeConnection();
  activeDbName = dbName;
};
