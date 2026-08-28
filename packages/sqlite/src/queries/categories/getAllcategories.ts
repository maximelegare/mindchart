import { CategoryTable } from "../../schema.root";
import { DB } from "../../utils/initialize/getOPDatabase";

export const getAllCategoriesQuery = async (db: DB) => {
  try {
    return await db
      .select({
        id: CategoryTable.id,
        name: CategoryTable.name,
        color: CategoryTable.color,
        createdAt: CategoryTable.createdAt,
      })
      .from(CategoryTable);
  } catch (error) {
    console.error(error);
  }
};
