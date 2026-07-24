import { eq } from "drizzle-orm";
import { Folder } from "../../../../zod-schemas/src/schemas";
import { FolderTable } from "../../schema.root";
import { DB } from "../../utils/initialize/getOPDatabase";

export const getFolderByIdQuery = async (
  db: DB,
  id: string
): Promise<Folder | undefined> => {
  try {
    const rows = await db
      .select({
        id: FolderTable.id,
        path: FolderTable.path,
        label: FolderTable.label,
        createdAt: FolderTable.createdAt,
      })
      .from(FolderTable)
      .where(eq(FolderTable.id, id))
      .limit(1);
    return rows[0];
  } catch (error) {
    console.error(error);
  }
};
