import { asc } from "drizzle-orm";
import { PersonTable } from "../../schema.root";
import { DB } from "../../utils/initialize/getOPDatabase";

export const getAllPersonsQuery = async (db: DB) => {
  return db.select().from(PersonTable).orderBy(asc(PersonTable.name));
};
