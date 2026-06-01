import { open, type SQLiteDatabase } from "@op-engineering/op-sqlite";
import { drizzle, OPSQLiteDatabase } from "drizzle-orm/op-sqlite";
import * as FileSystem from "expo-file-system/legacy";

let instance: OPSQLiteDatabase | null = null;
let rawSqlite: SQLiteDatabase | null = null;

// Defaults to the legacy filename so existing installs keep working until
// a workspace pointer is set explicitly via setActiveWorkspace().
let activeDbName: string = "mindchart.db";

const dbLocation = FileSystem.documentDirectory + "databases";

export type DB = OPSQLiteDatabase;

export const getOPDatabase = (): OPSQLiteDatabase => {
  if (!instance) {
    rawSqlite = open({ name: activeDbName, location: dbLocation });

    rawSqlite.execute("PRAGMA foreign_keys = ON;");
    instance = drizzle(rawSqlite);
  }
  return instance;
};

/**
 * Safely closes the database and resets the instance
 */
export const closeOPDatabase = async () => {
  if (rawSqlite) {
    rawSqlite.close();
    rawSqlite = null;
    instance = null;
  }
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
  await closeOPDatabase();
  activeDbName = dbName;
};
