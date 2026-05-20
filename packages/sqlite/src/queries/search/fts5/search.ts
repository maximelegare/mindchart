import { sql } from "drizzle-orm";
import { DB } from "../../../utils/initialize/getOPDatabase";

export const searchThoughtsInFTSQuery = async (db: DB, query: string) => {
  const normalized = query.trim().toLowerCase();
  if (!normalized) {
    return [];
  }
  try {
    return await db.all(sql`
    SELECT t.*
    FROM thought_fts f
      JOIN thought t ON t.id = f.id
      WHERE thought_fts MATCH ${normalized} ORDER BY bm25(thought_fts) LIMIT 20;
    `);
  } catch (error) {
    console.error("searchThoughtsInFTSQuery failed:", error);
    throw error;
  }
};
