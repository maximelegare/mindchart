import {
  getOPDatabase,
  getGraphDataQuery,
  getSyncGraphDataQuery,
  updateGraphDataQuery,
  updateSyncGraphDataQuery,
} from "@repo/sqlite";
import { GraphDataCache } from "@/features/graph/types/types";

export const fetchGraphData = async () => {
  const db = getOPDatabase();
  return await getGraphDataQuery(db);
};

export const fetchSyncGraph = async () => {
  const db = getOPDatabase();
  return await getSyncGraphDataQuery(db);
};

export const updateGraphData = async (data: GraphDataCache) => {
  const db = getOPDatabase();
  return updateGraphDataQuery(db, data);
};

export const updateSyncGraphData = async (data: boolean) => {
  const db = getOPDatabase();
  return await updateSyncGraphDataQuery(db, data);
};
