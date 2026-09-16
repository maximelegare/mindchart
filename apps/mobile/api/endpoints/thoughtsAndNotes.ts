import {
  getNoteByIdWithAssociatedThoughtsQuery,
  getNotesByIdsWithAssociatedThoughtsQuery,
  getNotesWithAssociatedThoughtsQuery,
  getPaginatedNotesWithThoughtsAndCountQuery,
  getOPDatabase,
  getPersonsByNoteIdQuery,
  getPersonsByNoteIdsQuery,
  type NoteListQueryParams,
} from "@repo/sqlite";

async function attachPersonsToNoteRows<T extends { note_id?: string | null }>(
  rows: T[] | undefined | null
) {
  if (!rows?.length) return rows ?? [];

  const db = getOPDatabase();
  const noteIds = rows
    .map((row) => row.note_id)
    .filter((id): id is string => !!id);
  const personRows = await getPersonsByNoteIdsQuery(db, noteIds);
  const personsByNoteId = new Map<string, typeof personRows>();

  for (const person of personRows) {
    const list = personsByNoteId.get(person.noteId) ?? [];
    list.push(person);
    personsByNoteId.set(person.noteId, list);
  }

  return rows.map((row) => ({
    ...row,
    persons_json: JSON.stringify(
      (personsByNoteId.get(row.note_id ?? "") ?? []).map(
        ({ noteId: _noteId, ...person }) => person
      )
    ),
  }));
}

export const fetchNotesAndThoughts = async () => {
  const db = getOPDatabase();
  const rows = await getNotesWithAssociatedThoughtsQuery(db);
  return attachPersonsToNoteRows(rows);
};

export type PaginatedNotesAndThoughtsRequest = NoteListQueryParams;

export type PaginatedNotesAndThoughtsResponse = {
  rows: Awaited<ReturnType<typeof attachPersonsToNoteRows>>;
  totalCount: number;
};

export const fetchPaginatedNotesAndThoughts = async (
  params: PaginatedNotesAndThoughtsRequest
): Promise<PaginatedNotesAndThoughtsResponse> => {
  const db = getOPDatabase();
  const { rows, totalCount } = await getPaginatedNotesWithThoughtsAndCountQuery(
    db,
    params
  );
  const withPersons = await attachPersonsToNoteRows(rows);
  return { rows: withPersons ?? [], totalCount };
};

export const fetchNotesByIdsWithThoughts = async (ids: string[]) => {
  const db = getOPDatabase();
  const rows = await getNotesByIdsWithAssociatedThoughtsQuery(db, ids);
  return attachPersonsToNoteRows(rows);
};

export const fetchNoteDetails = async (id: string) => {
  const db = getOPDatabase();
  const rows = await getNoteByIdWithAssociatedThoughtsQuery(db, id);
  if (!rows?.length) return rows;

  const persons = await getPersonsByNoteIdQuery(db, id);
  return rows.map((row) => ({
    ...row,
    persons_json: JSON.stringify(persons),
  }));
};
