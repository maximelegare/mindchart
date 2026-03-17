import { type DB } from "../../utils/initialize/getOPDatabase";

export const exportDatabaseQuery = async (db: DB, path: string) => {
  try {
    // Flush WAL to main database (extra safety)
    await db.run("PRAGMA wal_checkpoint(FULL);");

    // Create a clean snapshot
    await db.run(`VACUUM INTO '${path}';`);

    return path;
  } catch (error) {
    console.error("Database export failed:", error);
    throw error;
  }
};
