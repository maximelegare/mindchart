import { CategoryTable, ThoughtTable } from "../../schema.root";
import { DB } from "../../utils/initialize/getOPDatabase";
import { CategoryWithThoughtsInfos } from "../../../../zod-schemas/src/schemas";
import { count, eq } from "drizzle-orm";

export const getAllCategoriesWithThoughtsInfosQuery = async (
  db: DB
): Promise<CategoryWithThoughtsInfos[] | undefined> => {
  try {
    return await db
      .select({
        id: CategoryTable.id,
        name: CategoryTable.name,
        createdAt: CategoryTable.createdAt,
        thoughtCount: count(ThoughtTable.id),
      })
      .from(CategoryTable)
      .leftJoin(ThoughtTable, eq(CategoryTable.id, ThoughtTable.categoryId))
      .groupBy(CategoryTable.id);
  } catch (error) {
    console.error(error);
  }
};
