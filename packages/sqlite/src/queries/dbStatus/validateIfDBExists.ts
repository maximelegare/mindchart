import { getOPDatabase } from "../../utils/initialize/getOPDatabase";
import { sql } from "drizzle-orm";

export const validateIfDBExists = async (): Promise<boolean> => {
  try {
    const db = getOPDatabase();

    // Query the internal SQLite schema table to see if our tables exist
    // This will NOT throw an error even if the table is missing
    const result = await db.run(
      sql`SELECT name FROM sqlite_master WHERE type='table' AND name='app_data';`
    );

    // If the rows array has at least one entry, the table exists
    return result.rows.length > 0;
  } catch (error) {
    // This only catches actual connection/syntax errors
    console.error("Critical DB Check Failure:", error);
    return false;
  }
};
