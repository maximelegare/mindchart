import { ThoughtTable } from "../../schema.root";
import { type DB } from "../../utils/initialize/getOPDatabase";

export const getAllThoughtsQuery = async (db: DB) => {
  try {
    return await db.select().from(ThoughtTable);
  } catch (error) {
    console.error(error);
  }
};
