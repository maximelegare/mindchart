import { Person } from "@repo/zod-schemas/src/schemas";
import { PersonTable } from "../../schema.root";
import { DB } from "../../utils/initialize/getOPDatabase";

export const insertPersonQuery = async (db: DB, data: Person) => {
  return db.insert(PersonTable).values({
    id: data.id,
    name: data.name,
    contactId: data.contactId ?? null,
    phone: data.phone ?? null,
    email: data.email ?? null,
    createdAt: data.createdAt ?? new Date().toISOString(),
  });
};
