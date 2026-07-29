import {
  deleteFolderByPathQuery,
  getAllFoldersQuery,
  getAllFoldersWithNotesInfosQuery,
  getChildFoldersQuery,
  getFolderByIdQuery,
  getFolderContentsQuery,
  getOPDatabase,
  insertFolderQuery,
  moveFolderQuery,
  updateFolderLabelQuery,
} from "@repo/sqlite";
import { Folder } from "@repo/zod-schemas/src/schemas";

export const getAllFolders = async () => {
  const db = getOPDatabase();
  return await getAllFoldersQuery(db);
};

export const getAllFoldersWithNotesInfos = async () => {
  const db = getOPDatabase();
  return await getAllFoldersWithNotesInfosQuery(db);
};

export const getFolderById = async (id: string) => {
  const db = getOPDatabase();
  return await getFolderByIdQuery(db, id);
};

export const getChildFolders = async (parentPath: string | null) => {
  const db = getOPDatabase();
  return await getChildFoldersQuery(db, parentPath);
};

export const insertFolder = async (data: Folder) => {
  const db = getOPDatabase();
  return await insertFolderQuery(db, data);
};

export const updateFolderLabel = async (data: {
  id: string;
  label: string;
}) => {
  const db = getOPDatabase();
  return await updateFolderLabelQuery(db, data);
};

export const moveFolder = async (data: {
  folderId: string;
  newParentPath: string | null;
}) => {
  const db = getOPDatabase();
  return await moveFolderQuery(db, data);
};

export const deleteFolderByPath = async (path: string) => {
  const db = getOPDatabase();
  return await deleteFolderByPathQuery(db, path);
};

export const getFolderContents = async (folderId: string) => {
  const db = getOPDatabase();
  return await getFolderContentsQuery(db, folderId);
};
