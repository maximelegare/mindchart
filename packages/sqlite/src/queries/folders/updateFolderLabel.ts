import { eq } from "drizzle-orm";
import { FolderTable } from "../../schema.root";
import { DB } from "../../utils/initialize/getOPDatabase";

export const updateFolderLabelQuery = async (
  db: DB,
  data: { id: string; label: string }
) => {
  return await db
    .update(FolderTable)
    .set({ label: data.label })
    .where(eq(FolderTable.id, data.id));
};
