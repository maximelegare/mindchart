import { eq, like, or } from "drizzle-orm";
import { NoteTable, ThoughtTable, TopicTable } from "../../schema.root";
import { type DB } from "../../utils/initialize/getOPDatabase";

export const searchNotesQuery = async (db: DB, query: string) => {
  const trimmed = query.trim();
  if (!trimmed) {
    return { results: [] };
  }

  const term = `%${trimmed}%`;

  try {
    const notes = await db
      .select({
        id: NoteTable.id,
        title: NoteTable.title,
        summary: NoteTable.summary,
        rawText: NoteTable.rawText,
        topicId: NoteTable.topicId,
      })
      .from(NoteTable)
      .where(
        or(
          like(NoteTable.title, term),
          like(NoteTable.summary, term),
          like(NoteTable.rawText, term)
        )
      );

    const thoughts = await db
      .select({
        id: ThoughtTable.id,
        thoughtId: ThoughtTable.id,
        title: ThoughtTable.title,
        summary: ThoughtTable.summary,
        semanticLabel: ThoughtTable.semanticLabel,
        noteId: ThoughtTable.noteId,
        categoryId: ThoughtTable.categoryId,
        createdAt: ThoughtTable.createdAt,
        topicId: TopicTable.id,
        topicName: TopicTable.name,
      })
      .from(ThoughtTable)
      .leftJoin(NoteTable, eq(ThoughtTable.noteId, NoteTable.id))
      .leftJoin(TopicTable, eq(NoteTable.topicId, TopicTable.id))
      .where(
        or(
          like(ThoughtTable.title, term),
          like(ThoughtTable.summary, term),
          like(ThoughtTable.semanticLabel, term)
        )
      );

    const results = [];

    if (notes.length > 0) {
      results.push({
        type: "notes" as const,
        name: "Notes",
        results: notes,
      });
    }

    if (thoughts.length > 0) {
      results.push({
        type: "thoughts" as const,
        name: "Thoughts",
        results: thoughts,
      });
    }

    return { results };
  } catch (error) {
    console.error("Search error:", error);
    throw error;
  }
};
