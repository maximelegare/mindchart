import { useEffect, useState } from "react";
import { useMigrations } from "drizzle-orm/op-sqlite/migrator";
import { getOPDatabase } from "./initialize/getOPDatabase";
import migrations from "../migrations/migrations";
import { setupDB } from "./initialize/setupDB";

export const useMigrationHelper = () => {
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<unknown>(null);

  const db = getOPDatabase();

  // ✅ hook runs during render
  useMigrations(db, migrations);

  // ✅ async work happens in effect
  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      try {
        await setupDB();
        if (!cancelled) setSuccess(true);
      } catch (err) {
        if (!cancelled) setError(err);
      }
    };

    run();

    return () => {
      cancelled = true;
    };
  }, []);

  return { success, error };
};
