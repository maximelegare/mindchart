import {
  assembleThought,
  type Thought,
  type ThoughtType,
} from "@repo/zod-schemas";
import { generateID } from "@/utils/genrateID";

export type ThoughtsFormValue = Thought & {
  /** Paragraph pieces that should sit on the same line after a split. */
  inline?: boolean;
};

export type ThoughtsEditorFormValues = {
  thoughts: ThoughtsFormValue[];
};

export const createEmptyThought = (
  noteId: string,
  type: ThoughtType = "li"
): ThoughtsFormValue => {
  const thoughtId = generateID();
  return assembleThought({
    id: thoughtId,
    thoughtId,
    noteId,
    contentId: generateID(),
    title: "",
    semanticLabel: "",
    categoryId: "uncategorized",
    createdAt: new Date().toISOString(),
    type,
    contentText: "",
    checked: false,
  });
};

export const convertThoughtType = (
  thought: ThoughtsFormValue,
  type: ThoughtType
): ThoughtsFormValue => {
  if (thought.type === type) return thought;
  const text = thought.content.text;
  const contentId = generateID();
  const inline = type === "text" ? thought.inline : undefined;
  if (type === "checkbox") {
    return {
      ...thought,
      type,
      contentId,
      inline,
      content: { text, checked: false },
    };
  }
  return {
    ...thought,
    type,
    contentId,
    inline,
    content: { text },
  };
};

export const setThoughtContentText = (
  thought: ThoughtsFormValue,
  text: string
): ThoughtsFormValue => {
  if (thought.type === "checkbox") {
    return { ...thought, content: { text, checked: thought.content.checked } };
  }
  return { ...thought, content: { text } };
};
