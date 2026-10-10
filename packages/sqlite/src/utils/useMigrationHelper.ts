import { useEffect, useState } from "react";
import { useMigrations } from "drizzle-orm/op-sqlite/migrator";
import { getOPDatabase } from "./initialize/getOPDatabase";
import migrations from "../migrations/migrations";
import { setupDB } from "./initialize/setupDB";
import { sql } from "drizzle-orm";

export const useMigrationHelper = () => {
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<unknown>(null);

  const db = getOPDatabase();

  // Drizzle migrations (tables, schema, etc.)
  const { success: drizzleSuccess, error: drizzleError } = useMigrations(
    db,
    migrations
  );

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      try {
        // -----------------------------------
        // 1. run custom setup
        // -----------------------------------
        await setupDB();

        // -----------------------------------
        // 2. MANUAL FTS MIGRATIONS (IMPORTANT)
        // -----------------------------------
        await db.run(sql`
          CREATE VIRTUAL TABLE IF NOT EXISTS thought_fts USING fts5(
            id UNINDEXED,
            title,
            body,
            semantic_label
          );
        `);

        if (!cancelled) setSuccess(true);
      } catch (err) {
        if (!cancelled) setError(err);
      }
    };

    run();

    return () => {
      cancelled = true;
    };
  }, [db]);

  return {
    success: success && drizzleSuccess,
    error: error || drizzleError,
  };
};
