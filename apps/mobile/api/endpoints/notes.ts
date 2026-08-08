import { ClientOpenAIRoutes } from "@repo/constants";
import {
  deleteNoteByIdQuery,
  getAllNotesQuery,
  insertNoteQuery,
  setNotePersonsQuery,
  updateNoteFeelingQuery,
  updateNoteFolderIdQuery,
  updateNoteLocationQuery,
  updateNoteQuery,
  updateThoughtsQuery,
} from "@repo/sqlite";
import { getOPDatabase } from "@repo/sqlite";
import { insertThoughtsQuery } from "@repo/sqlite";
import { Note, Thought } from "@repo/zod-schemas/client";
import type { FeelingValue } from "@repo/zod-schemas/src/schemas";

export const insertNoteAndThoughts = async ({
  note,
  thoughts,
}: {
  note: Note;
  thoughts: Array<Thought>;
}) => {
  try {
    const db = getOPDatabase();
    await insertNoteQuery(db, note);
    await insertThoughtsQuery(db, thoughts);
    await setNotePersonsQuery(db, note.id, note.persons ?? []);
  } catch (error) {
    console.error(error);
  }
};

export const updateNoteAndThoughts = async ({
  note,
  thoughts,
}: {
  note: Note;
  thoughts: Array<Thought & { status: "new" | "updated" }>;
}) => {
  const db = getOPDatabase();
  await updateNoteQuery(db, note);
  await updateThoughtsQuery(db, thoughts);
  await setNotePersonsQuery(db, note.id, note.persons ?? []);
};

export const deleteNoteById = async ({ noteId }: { noteId: string }) => {
  const db = getOPDatabase();
  await deleteNoteByIdQuery(db, noteId);
};

export const updateNoteFolderId = async (data: {
  noteId: string;
  folderId: string | null;
}) => {
  const db = getOPDatabase();
  return await updateNoteFolderIdQuery(db, data);
};

export const updateNotePersons = async (data: {
  noteId: string;
  persons: Note["persons"];
}) => {
  const db = getOPDatabase();
  return await setNotePersonsQuery(db, data.noteId, data.persons ?? []);
};

export const updateNoteFeeling = async (data: {
  noteId: string;
  feeling: FeelingValue | null;
}) => {
  const db = getOPDatabase();
  return await updateNoteFeelingQuery(db, data);
};

export const updateNoteLocation = async (data: {
  noteId: string;
  locationId: string | null;
}) => {
  const db = getOPDatabase();
  return await updateNoteLocationQuery(db, data);
};

export const generateNote = async (body: FormData) => {
  const res = await fetch(
    process.env.EXPO_PUBLIC_SERVER_HOST + ClientOpenAIRoutes.generateNote,
    {
      body,
      method: "post",
      headers: { Accept: "application/json" },
    }
  );

  const text = await res.text();

  if (!res.ok) {
    throw new Error(`Server responded ${res.status}: ${text}`);
  }

  try {
    return JSON.parse(text);
  } catch (err) {
    console.error("Response was not JSON:", text);
    throw err;
  }
};

export const fetchAllNotes = async () => {
  const db = getOPDatabase();
  return await getAllNotesQuery(db);
};
