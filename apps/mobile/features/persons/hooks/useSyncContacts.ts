import { useCallback, useRef } from "react";
import * as Contacts from "expo-contacts";
import { Person } from "@repo/zod-schemas";
import { useControllers } from "@/api/controllers/useControllers";
import { generateID } from "@/utils/genrateID";
import { useContactsPermission } from "./useContactsPermission";

const mapContactToPerson = (contact: Contacts.Contact): Person | null => {
  const name =
    contact.name?.trim() ||
    [contact.firstName, contact.lastName].filter(Boolean).join(" ").trim();
  if (!name || !contact.id) return null;

  return {
    id: generateID(),
    name,
    contactId: contact.id,
    createdAt: new Date().toISOString(),
  };
};

/**
 * Requests contacts permission and upserts device contacts into the persons table.
 * Returns whether contacts access was granted.
 */
export const useSyncContacts = () => {
  const { requestContactsPermission } = useContactsPermission();
  const { useUpsertPersonsFromContactsMutation } = useControllers().persons;
  const { mutateAsync: upsertContacts } =
    useUpsertPersonsFromContactsMutation();
  const inFlightRef = useRef<Promise<boolean> | null>(null);

  const syncContacts = useCallback(async () => {
    if (inFlightRef.current) return inFlightRef.current;

    const run = (async () => {
      const granted = await requestContactsPermission();
      if (!granted) return false;

      const { data } = await Contacts.getContactsAsync({
        fields: [
          Contacts.Fields.Name,
          Contacts.Fields.FirstName,
          Contacts.Fields.LastName,
        ],
      });

      const persons = data
        .map(mapContactToPerson)
        .filter((person): person is Person => !!person);

      await upsertContacts({ contacts: persons });
      return true;
    })();

    inFlightRef.current = run;
    try {
      return await run;
    } finally {
      inFlightRef.current = null;
    }
  }, [requestContactsPermission, upsertContacts]);

  return { syncContacts };
};
