import { eq, sql } from "drizzle-orm";
import {
  EmbeddingTable,
  FolderTable,
  NoteTable,
  ThoughtTable,
  TopicTable,
} from "../../schema.root";
import { type DB } from "../../utils/initialize/getOPDatabase";

export const getAllThoughtsWithEmbeddingsQuery = async (db: DB) => {
  try {
    const rows = await db
      .select({
        id: EmbeddingTable.id,
        thoughtId: EmbeddingTable.thoughtId,
        summary: ThoughtTable.summary,
        title: ThoughtTable.title,
        categoryId: ThoughtTable.categoryId,
        noteId: ThoughtTable.noteId,
        semanticLabel: ThoughtTable.semanticLabel,
        topicName: TopicTable.name,
        topicId: TopicTable.id,
        folderId: NoteTable.folderId,
        folderLabel: FolderTable.label,
        folderPath: FolderTable.path,
        // Using raw SQL selection to ensure we get the clean binary blob
        embedding: sql<Uint8Array>`${EmbeddingTable.embedding}`,
        createdAt: ThoughtTable.createdAt,
      })
      .from(ThoughtTable)
      .innerJoin(EmbeddingTable, eq(EmbeddingTable.thoughtId, ThoughtTable.id))
      .innerJoin(NoteTable, eq(ThoughtTable.noteId, NoteTable.id))
      .leftJoin(TopicTable, eq(NoteTable.topicId, TopicTable.id))
      .leftJoin(FolderTable, eq(NoteTable.folderId, FolderTable.id));

    return rows.map((row) => {
      const raw = row.embedding;

      // If it's truly null or undefined, return empty
      if (!raw) {
        return { ...row, embedding: new Float32Array() };
      }

      /**
       * The Fix:
       * 1. Force into a fresh Uint8Array to normalize the driver's output.
       * 2. Slice the buffer to ensure 4-byte alignment for Float32.
       */
      const uint8 = new Uint8Array(raw as any);
      const buffer = uint8.buffer.slice(
        uint8.byteOffset,
        uint8.byteOffset + uint8.byteLength
      );

      return {
        ...row,
        embedding: new Float32Array(buffer),
      };
    });
  } catch (error) {
    console.error("Query failed:", error);
    return [];
  }
};
