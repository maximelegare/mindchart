import { open, type SQLiteDatabase } from "@op-engineering/op-sqlite";
import { drizzle, OPSQLiteDatabase } from "drizzle-orm/op-sqlite";
import * as FileSystem from "expo-file-system/legacy";

let instance: OPSQLiteDatabase | null = null;
let rawSqlite: SQLiteDatabase | null = null;

const dbLocation = FileSystem.documentDirectory + "databases";

export type DB = OPSQLiteDatabase;

export const getOPDatabase = (): OPSQLiteDatabase => {
  if (!instance) {
    const dbName = "mindchart.db";

    // open the DB
    rawSqlite = open({ name: dbName, location: dbLocation });

    // wrap in Drizzle
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
