import { generateID } from "@/utils/genrateID";

export type ThoughtsFormValue = {
  title: string;
  summary: string;
  semanticLabel: string;
  id: string;
  createdAt: string;
  noteId: string;
  categoryId: string;
  thoughtId: string;
};

export type ThoughtsEditorFormValues = {
  thoughts: ThoughtsFormValue[];
};

export const createEmptyThought = (noteId: string): ThoughtsFormValue => {
  const thoughtId = generateID();
  return {
    title: "",
    summary: "",
    semanticLabel: "",
    id: thoughtId,
    createdAt: new Date().toISOString(),
    noteId,
    categoryId: "uncategorized",
    thoughtId,
  };
};
