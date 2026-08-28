import { useCallback } from "react";
import { Note, Thought } from "@repo/zod-schemas";
import { useControllers } from "@/api/controllers/useControllers";

function asText(value: unknown): string {
  if (typeof value === "string") return value.trim();
  if (Array.isArray(value)) return value.map(String).join(" ").trim();
  if (value == null) return "";
  return String(value).trim();
}

export const useSaveNewNote = () => {
  const { notesAndThoughts, embeddings } = useControllers();

  const { mutateAsync: insertNoteAndThoughtsMutateAsync } =
    notesAndThoughts.useInsertNoteAndThoughtsMutation();
  const { mutateAsync: generateLocalEmbeddingsMutateAsync } =
    embeddings.useGenerateLocalEmbeddingsMutation();
  const { mutateAsync: insertEmbeddingsMutateAsync } =
    embeddings.useInsertEmbeddingsMutation();

  const saveNewNote = useCallback(
    async (note: Note, thoughts: Thought[]) => {
      const noteToInsert: Note = {
        ...note,
        title: asText(note.title),
        summary: asText(note.summary),
        rawText: note.rawText ?? "",
      };

      const thoughtsToInsert: Thought[] = thoughts.map((thought) => {
        const title = asText(thought.title);
        const summary = asText(thought.summary);
        const semanticLabel = asText(thought.semanticLabel) || title || summary;

        return {
          ...thought,
          title,
          summary,
          semanticLabel,
          categoryId: asText(thought.categoryId) || "uncategorized",
          noteId: noteToInsert.id,
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
    },
    [
      generateLocalEmbeddingsMutateAsync,
      insertEmbeddingsMutateAsync,
      insertNoteAndThoughtsMutateAsync,
    ]
  );

  return { saveNewNote };
};
