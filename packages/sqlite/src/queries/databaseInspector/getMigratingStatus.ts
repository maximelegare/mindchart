import { AppDataTable } from "../../schema.root";
import { type DB } from "../../utils/initialize/getOPDatabase";

export const getMigratingStatusQuery = async (db: DB) => {
  try {
    return await db
      .select({
        migrate: AppDataTable.migrate,
      })
      .from(AppDataTable)
      .limit(1);
  } catch (error) {
    console.error(error);
  }
};
