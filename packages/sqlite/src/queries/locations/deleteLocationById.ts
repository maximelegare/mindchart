import { eq } from "drizzle-orm";
import { LocationTable, NoteTable } from "../../schema.root";
import { DB } from "../../utils/initialize/getOPDatabase";

export const deleteLocationByIdQuery = async (db: DB, locationId: string) => {
  // SQLite ALTER TABLE FK may not include ON DELETE SET NULL, so clear refs first.
  return db.transaction(async (tx) => {
    await tx
      .update(NoteTable)
      .set({ locationId: null })
      .where(eq(NoteTable.locationId, locationId));
    return tx.delete(LocationTable).where(eq(LocationTable.id, locationId));
  });
};
