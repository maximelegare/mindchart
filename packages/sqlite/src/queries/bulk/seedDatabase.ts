import { DB } from "../../utils/initialize/getOPDatabase";

import type {
  Embedding,
  Note,
  Thought,
  Topic,
} from "../../../../zod-schemas/src/schemas";
import { insertNoteQuery } from "../notes/insertNote";
import { insertThoughtsQuery } from "../thoughts/insertThoughts";
import { insertEmbeddingsQuery } from "../embeddings/insertEmbeddings";
import { insertNewTopicQuery } from "../topics/insertNewTopic";
import { insertTopicsQuery } from "../topics/insertTopics";

export async function seedDatabaseQuery(
  db: DB,
  data: {
    notes: Note[];
    thoughts: Thought[];
    embeddings: Embedding[];
    topics: Topic[];
  }
) {
  await db.transaction(async (tx) => {
    try {
      // 0. Topics
      await insertTopicsQuery(tx, data.topics);

      // 1. Notes
      for (const note of data.notes) {
        await insertNoteQuery(tx, note);
      }

      // 2. Thoughts
      await insertThoughtsQuery(tx, data.thoughts);

      // 3. Embeddings
      await insertEmbeddingsQuery(tx, data.embeddings);
    } catch (error) {
      console.error(error);
      throw error; // IMPORTANT → rollback
    }
  });
}
