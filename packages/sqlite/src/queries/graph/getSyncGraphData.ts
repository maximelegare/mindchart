import { AppDataTable } from "../../schema.root";
import { type DB } from "../../utils/initialize/getOPDatabase";
import { eq } from "drizzle-orm";

export const getSyncGraphDataQuery = async (db: DB) => {
  try {
    const res = await db
      .select({ data: AppDataTable.data, id: AppDataTable.id })
      .from(AppDataTable)
      .where(eq(AppDataTable.id, "sync_graph"))
      .limit(1);

    if (!res[0]) return null;
    const item = res[0];
    const data = JSON.parse(item.data) as boolean;

    const result: Omit<typeof item, "data"> & { data: boolean } = {
      ...item,
      data: data,
    };

    return result;
  } catch (error) {
    console.error(error);
  }
};
