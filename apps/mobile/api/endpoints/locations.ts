import {
  deleteLocationByIdQuery,
  getAllLocationsQuery,
  getOPDatabase,
  insertLocationQuery,
} from "@repo/sqlite";
import type { Location } from "@repo/zod-schemas/src/schemas";

export const getAllLocations = async () => {
  const db = getOPDatabase();
  return await getAllLocationsQuery(db);
};

export const insertLocation = async (data: Location) => {
  const db = getOPDatabase();
  return await insertLocationQuery(db, data);
};

export const deleteLocationById = async (locationId: string) => {
  const db = getOPDatabase();
  return await deleteLocationByIdQuery(db, locationId);
};
