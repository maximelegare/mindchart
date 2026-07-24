export type FolderNotesGroup<T> = {
  id: string;
  name: string;
  notes: T[];
};

type NoteWithFolder = {
  folderId?: string | null;
  folderLabel?: string | null;
};

export const groupNotesByFolder = <T extends NoteWithFolder>(
  notes: T[]
): FolderNotesGroup<T>[] | null => {
  if (!notes.length) return null;

  const foldersById = new Map<string, FolderNotesGroup<T>>();

  for (const note of notes) {
    if (!note.folderId) continue;

    const existing = foldersById.get(note.folderId);
    if (existing) {
      existing.notes.push(note);
    } else {
      foldersById.set(note.folderId, {
        id: note.folderId,
        name: note.folderLabel ?? "",
        notes: [note],
      });
    }
  }

  const grouped = Array.from(foldersById.values());
  return grouped.length ? grouped : null;
};
