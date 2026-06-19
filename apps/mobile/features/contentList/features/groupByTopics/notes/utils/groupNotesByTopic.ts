export type TopicNotesGroup<T> = {
  id: string;
  name: string;
  notes: T[];
};

type NoteWithTopic = {
  topicId?: string | null;
  topicName?: string | null;
};

export const groupNotesByTopic = <T extends NoteWithTopic>(
  notes: T[]
): TopicNotesGroup<T>[] | null => {
  if (!notes.length) return null;

  const topicsById = new Map<string, TopicNotesGroup<T>>();

  for (const note of notes) {
    if (!note.topicId) continue;

    const existing = topicsById.get(note.topicId);
    if (existing) {
      existing.notes.push(note);
    } else {
      topicsById.set(note.topicId, {
        id: note.topicId,
        name: note.topicName ?? "",
        notes: [note],
      });
    }
  }

  const grouped = Array.from(topicsById.values());
  return grouped.length ? grouped : null;
};
