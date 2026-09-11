import type { Location } from "@repo/zod-schemas";
import { LocationTable } from "../../schema.root";
import { DB } from "../../utils/initialize/getOPDatabase";

export const insertLocationQuery = async (db: DB, data: Location) => {
  return db.insert(LocationTable).values({
    id: data.id,
    name: data.name,
    createdAt: data.createdAt ?? new Date().toISOString(),
  });
};
