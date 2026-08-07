import { asc } from "drizzle-orm";
import { LocationTable } from "../../schema.root";
import { DB } from "../../utils/initialize/getOPDatabase";

export const getAllLocationsQuery = async (db: DB) => {
  return db
    .select({
      id: LocationTable.id,
      name: LocationTable.name,
      createdAt: LocationTable.createdAt,
    })
    .from(LocationTable)
    .orderBy(asc(LocationTable.name));
};
