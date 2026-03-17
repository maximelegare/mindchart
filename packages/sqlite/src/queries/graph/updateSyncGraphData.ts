import { AppDataTable } from "../../schema.root";
import { DB } from "../../utils/initialize/getOPDatabase";
import { eq } from "drizzle-orm";

export const updateSyncGraphDataQuery = async (db: DB, data: boolean) => {
  try {
    console.log("data", data);
    return await db
      .update(AppDataTable)
      .set({ data: JSON.stringify(data) })
      .where(eq(AppDataTable.id, "sync_graph"));
  } catch (error) {
    console.error(error);
    throw error;
  }
};
