import { create } from "zustand";

type NoteSaveStore = {
  pendingIds: Record<string, true>;
  startSave: (noteId: string) => void;
  finishSave: (noteId: string) => void;
};

export const useNoteSaveStore = create<NoteSaveStore>((set) => ({
  pendingIds: {},
  startSave: (noteId) =>
    set((state) => ({
      pendingIds: { ...state.pendingIds, [noteId]: true },
    })),
  finishSave: (noteId) =>
    set((state) => {
      if (!state.pendingIds[noteId]) return state;
      const pendingIds = { ...state.pendingIds };
      delete pendingIds[noteId];
      return { pendingIds };
    }),
}));

export const useIsNoteSavePending = (noteId?: string | null) =>
  useNoteSaveStore((state) => Boolean(noteId && state.pendingIds[noteId]));

export const useHasAnyNoteSavePending = () =>
  useNoteSaveStore((state) => Object.keys(state.pendingIds).length > 0);
