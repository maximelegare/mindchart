import { Note, Thought } from "@repo/zod-schemas";
import { NoteEditor } from "../components/noteEditor";

export const EditNoteFeature = ({
  noteId,
  setOpen,
  onAction,
}: {
  noteId: string;
  setOpen: (open: boolean) => void;
  onAction: (
    note: Note,
    thoughts: (Thought & { status: "new" | "updated" })[],
    thoughtsToDelete: string[]
  ) => void;
}) => {
  return <NoteEditor noteId={noteId} setOpen={setOpen} onAction={onAction} />;
};
