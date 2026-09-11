import {
  getMigratingStatusQuery,
  getOPDatabase,
  updateMigratingStatusQuery,
} from "@repo/sqlite";

export const fetchMigratingStatus = async () => {
  const db = getOPDatabase();
  return await getMigratingStatusQuery(db);

  // return await getSyncGraphDataQuery(db);
};

export const updateMigratingStatus = async (data: boolean) => {
  const db = getOPDatabase();
  return updateMigratingStatusQuery(db, data);
};
