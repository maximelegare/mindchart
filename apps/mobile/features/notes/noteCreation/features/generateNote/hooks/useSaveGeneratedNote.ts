import { useCallback } from "react";
import { Note, Thought } from "@repo/zod-schemas";
import { useControllers } from "@/api/controllers/useControllers";

export type SaveGeneratedNoteInput = {
  note: Note;
  thoughts: Thought[];
  folderId?: string | null;
};

function asText(value: unknown): string {
  if (typeof value === "string") return value.trim();
  if (Array.isArray(value)) return value.map(String).join(" ").trim();
  if (value == null) return "";
  return String(value).trim();
}

/**
 * Persists an AI-generated note: embeddings → note/thoughts → embeddings rows.
 * Returns the saved note id for navigation.
 */
export const useSaveGeneratedNote = () => {
  const { notesAndThoughts, embeddings } = useControllers();

  const { useInsertNoteAndThoughtsMutation } = notesAndThoughts;
  const { useInsertEmbeddingsMutation, useGenerateLocalEmbeddingsMutation } =
    embeddings;

  const { mutateAsync: insertNoteAndThoughtsMutateAsync } =
    useInsertNoteAndThoughtsMutation();
  const { mutateAsync: generateLocalEmbeddingsMutateAsync } =
    useGenerateLocalEmbeddingsMutation();
  const { mutateAsync: insertEmbeddingsMutateAsync } =
    useInsertEmbeddingsMutation();

  const saveGeneratedNote = useCallback(
    async ({ note, thoughts, folderId }: SaveGeneratedNoteInput) => {
      const noteToInsert: Note = {
        id: note.id,
        title: asText(note.title),
        summary: asText(note.summary),
        rawText: note.rawText ?? "",
        folderId: folderId ?? note.folderId ?? null,
        persons: note.persons ?? [],
        feeling: note.feeling ?? null,
        locationId: note.locationId ?? null,
        locationName: note.locationName ?? null,
        createdAt: note.createdAt ?? new Date().toISOString(),
      };

      const thoughtsToInsert: Thought[] = thoughts.map((thought) => {
        const title = asText(thought.title);
        const summary = asText(thought.summary);
        const semanticLabel = asText(thought.semanticLabel) || title || summary;

        return {
          id: thought.id,
          thoughtId: thought.thoughtId || thought.id,
          noteId: noteToInsert.id,
          title,
          summary,
          semanticLabel,
          categoryId: asText(thought.categoryId) || "uncategorized",
          createdAt: thought.createdAt ?? new Date().toISOString(),
        };
      });

      const generatedEmbeddings = await generateLocalEmbeddingsMutateAsync({
        thoughts: thoughtsToInsert,
      });

      await insertNoteAndThoughtsMutateAsync({
        note: noteToInsert,
        thoughts: thoughtsToInsert,
      });
      await insertEmbeddingsMutateAsync({ data: generatedEmbeddings });

      return noteToInsert.id;
    },
    [
      generateLocalEmbeddingsMutateAsync,
      insertEmbeddingsMutateAsync,
      insertNoteAndThoughtsMutateAsync,
    ]
  );

  return { saveGeneratedNote };
};
