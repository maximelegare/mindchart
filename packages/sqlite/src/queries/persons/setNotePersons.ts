import { eq } from "drizzle-orm";
import { Person } from "@repo/zod-schemas/src/schemas";
import { PersonTable, PersonToNoteTable } from "../../schema.root";
import { DB } from "../../utils/initialize/getOPDatabase";

/**
 * Replaces person↔note links for a note. Ensures each person row exists first.
 */
export const setNotePersonsQuery = async (
  db: DB,
  noteId: string,
  persons: Person[]
) => {
  await db.transaction(async (tx) => {
    await tx
      .delete(PersonToNoteTable)
      .where(eq(PersonToNoteTable.noteId, noteId));

    for (const person of persons) {
      const existing = await tx
        .select({ id: PersonTable.id })
        .from(PersonTable)
        .where(eq(PersonTable.id, person.id))
        .limit(1);

      if (!existing[0]) {
        await tx.insert(PersonTable).values({
          id: person.id,
          name: person.name,
          contactId: person.contactId ?? null,
          phone: person.phone ?? null,
          email: person.email ?? null,
          createdAt: person.createdAt ?? new Date().toISOString(),
        });
      }

      await tx.insert(PersonToNoteTable).values({
        personId: person.id,
        noteId,
        createdAt: new Date().toISOString(),
      });
    }
  });
};
