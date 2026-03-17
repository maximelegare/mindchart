import { AppDataTable } from "../../schema.root";
import { DB } from "../../utils/initialize/getOPDatabase";
import { eq } from "drizzle-orm";

export const updateGraphDataQuery = async (db: DB, data: any) => {
  try {
    return await db
      .update(AppDataTable)
      .set({ data: JSON.stringify(data) })
      .where(eq(AppDataTable.id, "graph_data"));
  } catch (error) {
    console.error(error);
    throw error;
  }
};
