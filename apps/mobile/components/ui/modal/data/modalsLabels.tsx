import { fbs } from "fbtee";
import type { ModalPreset } from "./modals";

export function getDeleteFolderConfirmationModal(): ModalPreset {
  return {
    title: fbs("Delete Folder?", "Delete folder confirmation modal title"),
    description: fbs(
      "This will permanently delete this folder and all nested folders.",
      "Delete folder confirmation modal description"
    ),
    confirmButton: {
      text: fbs("Delete", "Delete folder confirmation confirm button"),
      variant: "destructive",
    },
    cancelButton: {
      text: fbs("Cancel", "Delete folder confirmation cancel button"),
      variant: "default",
    },
  };
}

export function getDeleteNoteConfirmationModal(): ModalPreset {
  return {
    title: fbs(
      "Are you sure you want to delete this note?",
      "Delete note confirmation modal title"
    ),
    description: fbs(
      "This will permanently delete this note and all associated thoughts.",
      "Delete note confirmation modal description"
    ),
    confirmButton: {
      text: fbs("Delete", "Delete note confirmation confirm button"),
      variant: "destructive",
    },
    cancelButton: {
      text: fbs("Cancel", "Delete note confirmation cancel button"),
      variant: "default",
    },
  };
}
