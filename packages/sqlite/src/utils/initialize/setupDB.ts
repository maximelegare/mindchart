import { AppDataTable, CategoryTable, SettingTable } from "../../schema.root";
import {
  SETTINGS_DEFINITIONS,
  CATEGORIES_DEFINITIONS,
  APP_DATA_DEFINITIONS,
} from "../../data/settings";
import { getOPDatabase } from "./getOPDatabase";
import { validateIfDBExists } from "../../queries/dbStatus/validateIfDBExists";

export const setupDB = async (retries = 10, delay = 200) => {
  const db = getOPDatabase();

  // Retry logic to wait for migrations to complete and check if data already exists
  for (let i = 0; i < retries; i++) {
    try {
      // Try to query AppDataTable to check if tables exist and if data is already there
      const dbExists = await validateIfDBExists();
      // If data exists, we're done
      if (dbExists) return;
      // If table exists but is empty, break and proceed with setup
      break;
    } catch (err: unknown) {
      // If table doesn't exist yet (migrations still running), wait and retry
      if (i < retries - 1) {
        await new Promise((resolve) => setTimeout(resolve, delay));
        continue;
      }
      // If all retries failed, throw the error
      throw err;
    }
  }

  const settings = SETTINGS_DEFINITIONS.map((s) => ({
    id: s.id,
    name: s.name,
    data: s.data,
  }));

  const categories = CATEGORIES_DEFINITIONS.map((c) => ({
    id: c.id,
    name: c.name,
  }));

  const appData = APP_DATA_DEFINITIONS.map((a) => ({
    id: a.id,
    name: a.name,
    data: a.data,
  }));

  // Retry inserting data in case tables aren't fully ready yet
  for (let i = 0; i < retries; i++) {
    try {
      await db.transaction(async (tx) => {
        await tx.insert(SettingTable).values(settings);
        await tx.insert(CategoryTable).values(categories);
        await tx.insert(AppDataTable).values(appData);
      });
      // Success! Break out of retry loop
      return;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      // If it's a "no such table" error and we have retries left, wait and retry
      if (errorMessage.includes("no such table") && i < retries - 1) {
        await new Promise((resolve) => setTimeout(resolve, delay));
        continue;
      }
      // Otherwise, log and throw
      console.error("Error setting up DB:", error);
      throw error;
    }
  }
};
