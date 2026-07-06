import React, { createContext, useContext, useRef } from "react";
import { createStore, useStore, type StoreApi } from "zustand";

export type CreationMode = "ai" | "manual";
export type InputView = "audio" | "input";

type NoteCreationState = {
  creationMode: CreationMode;
  inputView: InputView;
  setCreationMode: (mode: CreationMode) => void;
  setInputView: (view: InputView) => void;
};

export const createNoteCreationStore = () =>
  createStore<NoteCreationState>((set) => ({
    creationMode: "ai",
    inputView: "audio",
    setCreationMode: (creationMode) => set({ creationMode }),
    setInputView: (inputView) => set({ inputView }),
  }));

type NoteCreationStore = StoreApi<NoteCreationState>;

const NoteCreationContext = createContext<NoteCreationStore | null>(null);

export const NoteCreationProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const storeRef = useRef<NoteCreationStore | null>(null);
  if (!storeRef.current) {
    storeRef.current = createNoteCreationStore();
  }

  return (
    <NoteCreationContext.Provider value={storeRef.current}>
      {children}
    </NoteCreationContext.Provider>
  );
};

export const useNoteCreationStore = <T,>(
  selector: (state: NoteCreationState) => T
): T => {
  const store = useContext(NoteCreationContext);
  if (!store) {
    throw new Error(
      "useNoteCreationStore must be used within NoteCreationProvider"
    );
  }
  return useStore(store, selector);
};
