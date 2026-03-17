import { ClientOpenAIRoutes } from "@repo/constants";
import { insertNoteQuery } from "@repo/sqlite";
import { getOPDatabase } from "@repo/sqlite";
import { insertThoughtsQuery } from "@repo/sqlite";
import { Note, Thought } from "@repo/zod-schemas/client";

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
    // await insertPendingEmbeddingsQuery(db, thoughts);
  } catch (error) {
    console.error(error);
  }
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
