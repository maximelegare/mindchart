import { AppDataTable } from "../../schema.root";
import { type DB } from "../../utils/initialize/getOPDatabase";

export const updateMigratingStatusQuery = async (db: DB, data: boolean) => {
  try {
    return await db.update(AppDataTable).set({ migrate: data });
  } catch (error) {
    console.error(error);
  }
};
