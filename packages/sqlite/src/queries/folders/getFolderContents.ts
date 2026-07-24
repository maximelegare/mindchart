import { DB } from "../../utils/initialize/getOPDatabase";

/**
 * Stub: folder contents (notes/items) are not linked yet.
 * Always returns an empty list.
 */
export const getFolderContentsQuery = async (
  _db: DB,
  _folderId: string
): Promise<[]> => {
  return [];
};
