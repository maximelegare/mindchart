export type NoteEditorMode = "regular" | "preview" | "new";

export type BindNoteSave = (save: (() => void) | null) => void;

export type NoteSaveFinished = () => void;
