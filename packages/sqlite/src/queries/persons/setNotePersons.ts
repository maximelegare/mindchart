import { eq } from "drizzle-orm";
import { Person } from "@repo/zod-schemas/src/schemas";
import { PersonTable, PersonToNoteTable } from "../../schema.root";
import { DB } from "../../utils/initialize/getOPDatabase";

/**
 * Replaces person↔note links for a note. Ensures each person row exists first.
 *
 * Sequential (no Drizzle `db.transaction`): the OP SQLite driver commits
 * before awaiting async transaction callbacks, so nested transactions drop
 * writes on Hermes/production.
 */
export const setNotePersonsQuery = async (
  db: DB,
  noteId: string,
  persons: Person[]
) => {
  await db
    .delete(PersonToNoteTable)
    .where(eq(PersonToNoteTable.noteId, noteId));

  for (const person of persons) {
    const existing = await db
      .select({ id: PersonTable.id })
      .from(PersonTable)
      .where(eq(PersonTable.id, person.id))
      .limit(1);

    if (!existing[0]) {
      await db.insert(PersonTable).values({
        id: person.id,
        name: person.name,
        contactId: person.contactId ?? null,
        phone: null,
        email: null,
        createdAt: person.createdAt ?? new Date().toISOString(),
      });
    }

    await db.insert(PersonToNoteTable).values({
      personId: person.id,
      noteId,
      createdAt: new Date().toISOString(),
    });
  }
};
