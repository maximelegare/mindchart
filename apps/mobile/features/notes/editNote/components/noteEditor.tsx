import React from "react";
import { useBottomSheet } from "@/components/primitives/bottomSheet/bottom-sheet.native";

import { EditNotePreview } from "./editNotePreview";
import { useControllers } from "@/api/controllers/useControllers";
import { parseNoteAndThoughts } from "../../shared/utils/parseNoteAndThoughts";
import { Note, Thought } from "@repo/zod-schemas";

interface NoteEditorProps {
  noteId: string;
  setOpen: (open: boolean) => void;
  onAction: (
    note: Note,
    thoughts: (Thought & { status: "new" | "updated" })[],
    thoughtsToDelete: string[]
  ) => void;
}

export const NoteEditor = ({ noteId, setOpen, onAction }: NoteEditorProps) => {
  // Use the helper hook from your primitive file to get the ref and controls
  const { close } = useBottomSheet();

  const { useFetchNoteDetails } = useControllers().notesAndThoughts;
  const { useFetchAllCategoriesQuery } = useControllers().categories;

  // const { useGenerateLocalEmbeddingsMutation, useUpdateEmbeddingsMutation } = useControllers().embeddings;
  // const { mutateAsync: updateEmbeddingsMutateAsync } = useUpdateEmbeddingsMutation();
  // const { mutateAsync: generateLocalEmbeddingsMutateAsync } = useGenerateLocalEmbeddingsMutation();

  const { data: categoriesData } = useFetchAllCategoriesQuery();

  const { data } = useFetchNoteDetails(noteId);
  const parsedData = parseNoteAndThoughts(data);

  if (!parsedData) return null;

  const { title, thoughts, summary, id } = parsedData[0];

  const note: Note = {
    id,
    title,
    topicId: "test",
    summary: summary,
  };

  const onActionHandler = async (
    note: Note,
    thoughts: (Thought & { status: "new" | "updated" })[],
    thoughtsToDelete: string[]
  ) => {
    onAction(note, thoughts, thoughtsToDelete);

    setTimeout(() => {
      close();
    }, 150);
    setOpen(false);
  };

  const onCancel = () => {
    // Wait for the dropdown to close completely before closing the bottom sheet
    // Makes for a smoother experience
    setTimeout(() => {
      close();
    }, 150);
    // 2. Close the parent Dialog/Dropdown
    setOpen(false);
  };

  return (
    <EditNotePreview
      categories={categoriesData ?? []}
      note={note}
      // Example logic: doubling thoughts as in your original snippet
      thoughts={[...thoughts]}
      topic={{
        id: "test",
        name: "test",
        createdAt: "test",
        embedding: new Float32Array(),
      }}
      onAction={onActionHandler}
      onCancel={onCancel}
    />
  );
};
