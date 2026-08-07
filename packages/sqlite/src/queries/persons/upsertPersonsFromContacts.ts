import { eq } from "drizzle-orm";
import { Person } from "@repo/zod-schemas/src/schemas";
import { PersonTable } from "../../schema.root";
import { DB } from "../../utils/initialize/getOPDatabase";

export const upsertPersonsFromContactsQuery = async (
  db: DB,
  contacts: Person[]
) => {
  if (contacts.length === 0) return;

  await db.transaction(async (tx) => {
    for (const contact of contacts) {
      if (!contact.contactId) continue;

      const existing = await tx
        .select({ id: PersonTable.id })
        .from(PersonTable)
        .where(eq(PersonTable.contactId, contact.contactId))
        .limit(1);

      if (existing[0]) {
        await tx
          .update(PersonTable)
          .set({
            name: contact.name,
            phone: null,
            email: null,
          })
          .where(eq(PersonTable.id, existing[0].id));
      } else {
        await tx.insert(PersonTable).values({
          id: contact.id,
          name: contact.name,
          contactId: contact.contactId,
          phone: null,
          email: null,
          createdAt: contact.createdAt ?? new Date().toISOString(),
        });
      }
    }
  });
};
