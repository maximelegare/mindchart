import { eq } from "drizzle-orm";
import { CategoryTranslationTable } from "../../schema.root";
import { DB } from "../../utils/initialize/getOPDatabase";

export const getCategoryTranslationsByLangQuery = async (
  db: DB,
  lang: string
) => {
  try {
    return await db
      .select({
        id: CategoryTranslationTable.id,
        lang: CategoryTranslationTable.lang,
        label: CategoryTranslationTable.label,
        createdAt: CategoryTranslationTable.createdAt,
        editedAt: CategoryTranslationTable.editedAt,
      })
      .from(CategoryTranslationTable)
      .where(eq(CategoryTranslationTable.lang, lang));
  } catch (error) {
    console.error(error);
    return [];
  }
};

export const getAllCategoryTranslationsQuery = async (db: DB) => {
  try {
    return await db
      .select({
        id: CategoryTranslationTable.id,
        lang: CategoryTranslationTable.lang,
        label: CategoryTranslationTable.label,
        createdAt: CategoryTranslationTable.createdAt,
        editedAt: CategoryTranslationTable.editedAt,
      })
      .from(CategoryTranslationTable);
  } catch (error) {
    console.error(error);
    return [];
  }
};
