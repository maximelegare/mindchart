import type { ButtonProps } from "../../button";

export type ModalButtonConfig = {
  text: string;
  variant?: NonNullable<ButtonProps["variant"]>;
};

type ModalPreset = {
  title: string;
  description: string;
  confirmButton: ModalButtonConfig;
  cancelButton: ModalButtonConfig;
};

export const MODALS_CONTENT: Record<
  | "DELETE_DATABASE_FILE"
  | "DELETE_WORKSPACE"
  | "IMPORT_WORKSPACE_CHOICE"
  | "INITIALIZE_MODEL_ERROR"
  | "DELETE_MODEL_ERROR"
  | "DELETE_MODEL_ACTION"
  | "AI_SETUP_REQUIRED"
  | "DELETE_NOTE_CONFIRMATION"
  | "DISABLE_RECOVERY_PASSWORD"
  | "BIOMETRICS_UNAVAILABLE"
  | "DELETE_FOLDER_CONFIRMATION"
  | "DELETE_LOCATION_CONFIRMATION",
  ModalPreset
> = {
  DELETE_LOCATION_CONFIRMATION: {
    title: "Remove Location?",
    description: "This will remove this location from all notes that use it.",
    confirmButton: { text: "Remove", variant: "destructive" },
    cancelButton: { text: "Cancel", variant: "default" },
  },
  DELETE_FOLDER_CONFIRMATION: {
    title: "Delete Folder?",
    description:
      "This will permanently delete this folder and all nested folders.",
    confirmButton: { text: "Delete", variant: "destructive" },
    cancelButton: { text: "Cancel", variant: "default" },
  },
  DELETE_DATABASE_FILE: {
    title: "Delete Workspace?",
    description:
      "This will permanently delete your database. You can always re-import it later.",
    confirmButton: { text: "Delete", variant: "destructive" },
    cancelButton: { text: "Cancel", variant: "default" },
  },
  DELETE_WORKSPACE: {
    title: "Delete Workspace?",
    description:
      "This will permanently delete this workspace's database. You can always re-import it later.",
    confirmButton: { text: "Delete", variant: "destructive" },
    cancelButton: { text: "Cancel", variant: "default" },
  },
  IMPORT_WORKSPACE_CHOICE: {
    title: "Import Workspace",
    description:
      "Create a new workspace from this file, or overwrite the currently active workspace?",
    confirmButton: { text: "New workspace", variant: "default" },
    cancelButton: { text: "Overwrite active", variant: "destructive" },
  },
  INITIALIZE_MODEL_ERROR: {
    title: "Failed to initialize LLM.",
    description: "You will need to download it again to use it.",
    confirmButton: { text: "Ok" },
    cancelButton: { text: "Cancel" },
  },
  DELETE_MODEL_ERROR: {
    title: "Failed to delete model entirely.",
    description: "You will need to download it again to use it.",
    confirmButton: { text: "Delete" },
    cancelButton: { text: "Cancel" },
  },
  DELETE_MODEL_ACTION: {
    title: "Are you sure you want to remove this model?",
    description: "You will need to download it again to use it.",
    confirmButton: { text: "Delete" },
    cancelButton: { text: "Cancel" },
  },
  AI_SETUP_REQUIRED: {
    title: "AI Setup Required",
    description:
      "You will need to download an embeddings model to use local AI features. Go to Settings to set it up.",
    confirmButton: { text: "Go to Settings" },
    cancelButton: { text: "Cancel" },
  },
  DELETE_NOTE_CONFIRMATION: {
    title: "Are you sure you want to delete this note?",
    description:
      "This will permanently delete this note and all associated thoughts.",
    confirmButton: { text: "Delete", variant: "destructive" },
    cancelButton: { text: "Cancel", variant: "default" },
  },
  DISABLE_RECOVERY_PASSWORD: {
    title: "Disable recovery passphrase",
    description:
      "This deletes your recovery passphrase. Exports made with recovery enabled won't unlock with recovery unless you remember the passphrase you chose.",
    confirmButton: { text: "Disable", variant: "destructive" },
    cancelButton: { text: "Cancel", variant: "default" },
  },
  BIOMETRICS_UNAVAILABLE: {
    title: "Biometrics unavailable",
    description:
      "Use a device with Face ID or fingerprint enrolled, and a development build (not Expo Go).",
    confirmButton: { text: "Ok", variant: "default" },
    cancelButton: { text: "Cancel", variant: "default" },
  },
};

export type ModalContent = keyof typeof MODALS_CONTENT;
