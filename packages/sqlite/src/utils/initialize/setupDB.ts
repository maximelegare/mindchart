import {
  AppDataTable,
  CategoryTable,
  CategoryTranslationTable,
  FeelingTable,
  SettingTable,
} from "../../schema.root";
import {
  SETTINGS_DEFINITIONS,
  CATEGORIES_DEFINITIONS,
  CATEGORIES_TRANSLATIONS,
  APP_DATA_DEFINITIONS,
  FEELINGS_DEFINITIONS,
} from "../../data/settings";
import { getOPDatabase } from "./getOPDatabase";
import { sql } from "drizzle-orm";

export const setupDB = async (retries = 10, delay = 200) => {
  const db = getOPDatabase();

  // Wait for the migration to have created `app_data`, then decide based on
  // whether ROWS are present (not just the table). The old logic returned as
  // soon as the table existed, which after `migrate()` is always true — that
  // skipped seeding entirely and left fresh workspaces without sync_graph /
  // graph_data / settings / categories rows.
  for (let i = 0; i < retries; i++) {
    try {
      const result = await db.run(sql`SELECT COUNT(*) AS c FROM app_data;`);
      // Drizzle's op-sqlite driver returns `rows` as a plain array at
      // runtime even though the `op-sqlite` types expose `.item()`,
      // so we cast through `unknown` to access by index safely.
      const rows = result.rows as unknown as Array<{ c?: number }>;
      const count = Number(rows[0]?.c ?? 0);
      // Already seeded
      if (count > 0) return;
      // Table exists but empty — proceed to seed
      break;
    } catch (err: unknown) {
      // Table doesn't exist yet (migrations still running): wait and retry
      if (i < retries - 1) {
        await new Promise((resolve) => setTimeout(resolve, delay));
        continue;
      }
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
    color: c.color,
  }));

  const categoryTranslations = CATEGORIES_TRANSLATIONS.flatMap(
    ({ lang, translations }) =>
      Object.entries(translations).map(([id, label]) => ({
        id,
        lang,
        label,
      }))
  );

  const feelings = FEELINGS_DEFINITIONS.map((feeling) => ({
    value: feeling.value,
    label: feeling.label,
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
        await tx
          .insert(CategoryTranslationTable)
          .values(categoryTranslations)
          .onConflictDoNothing();
        await tx.insert(FeelingTable).values(feelings).onConflictDoNothing();
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
