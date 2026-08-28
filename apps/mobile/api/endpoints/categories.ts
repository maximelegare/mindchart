import {
  getAllCategoriesQuery,
  getAllCategoriesWithThoughtsInfosQuery,
  getCategoryTranslationsByLangQuery,
  getOPDatabase,
} from "@repo/sqlite";

export const fetchAllCategories = async () => {
  const db = getOPDatabase();
  return await getAllCategoriesQuery(db);
};

export const fetchAllCategoriesWithThoughtsInfos = async () => {
  const db = getOPDatabase();
  return await getAllCategoriesWithThoughtsInfosQuery(db);
};

export const fetchCategoryTranslationsByLang = async (lang: string) => {
  const db = getOPDatabase();
  return await getCategoryTranslationsByLangQuery(db, lang);
};
