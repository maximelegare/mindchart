import { eq, sql } from "drizzle-orm";
import { assembleThought } from "@repo/zod-schemas";
import {
  CheckboxContentTable,
  EmbeddingTable,
  FolderTable,
  ListItemContentTable,
  NoteTable,
  TextContentTable,
  ThoughtTable,
} from "../../schema.root";
import { type DB } from "../../utils/initialize/getOPDatabase";

export const getAllThoughtsWithEmbeddingsQuery = async (db: DB) => {
  try {
    const rows = await db
      .select({
        embeddingId: EmbeddingTable.id,
        thoughtId: ThoughtTable.id,
        title: ThoughtTable.title,
        categoryId: ThoughtTable.categoryId,
        noteId: ThoughtTable.noteId,
        semanticLabel: ThoughtTable.semanticLabel,
        type: ThoughtTable.type,
        contentId: ThoughtTable.contentId,
        contentText: sql<string>`COALESCE(
          ${TextContentTable.text},
          ${ListItemContentTable.text},
          ${CheckboxContentTable.text},
          ''
        )`,
        checked: CheckboxContentTable.checked,
        folderId: NoteTable.folderId,
        folderLabel: FolderTable.label,
        folderPath: FolderTable.path,
        showTitles: NoteTable.showTitles,
        embedding: sql<Uint8Array | null>`${EmbeddingTable.embedding}`,
        createdAt: ThoughtTable.createdAt,
      })
      .from(ThoughtTable)
      .leftJoin(
        TextContentTable,
        eq(TextContentTable.id, ThoughtTable.contentId)
      )
      .leftJoin(
        ListItemContentTable,
        eq(ListItemContentTable.id, ThoughtTable.contentId)
      )
      .leftJoin(
        CheckboxContentTable,
        eq(CheckboxContentTable.id, ThoughtTable.contentId)
      )
      .leftJoin(EmbeddingTable, eq(EmbeddingTable.thoughtId, ThoughtTable.id))
      .innerJoin(NoteTable, eq(ThoughtTable.noteId, NoteTable.id))
      .leftJoin(FolderTable, eq(NoteTable.folderId, FolderTable.id));

    return rows.map((row) => {
      const thought = assembleThought({
        id: row.thoughtId,
        thoughtId: row.thoughtId,
        title: row.title,
        categoryId: row.categoryId,
        noteId: row.noteId,
        semanticLabel: row.semanticLabel,
        type: row.type,
        contentId: row.contentId,
        contentText: row.contentText,
        checked: row.checked,
        folderId: row.folderId,
        folderLabel: row.folderLabel,
        folderPath: row.folderPath,
        createdAt: row.createdAt,
      });

      const raw = row.embedding;
      if (!raw) {
        return {
          ...thought,
          showTitles: row.showTitles,
          embedding: null,
        };
      }

      const uint8 = new Uint8Array(raw);
      const buffer = uint8.buffer.slice(
        uint8.byteOffset,
        uint8.byteOffset + uint8.byteLength
      );

      return {
        ...thought,
        showTitles: row.showTitles,
        embedding: new Float32Array(buffer),
      };
    });
  } catch (error) {
    console.error("Query failed:", error);
    return [];
  }
};
