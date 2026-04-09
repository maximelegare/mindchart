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
  | "INITIALIZE_MODEL_ERROR"
  | "DELETE_MODEL_ERROR"
  | "DELETE_MODEL_ACTION"
  | "AI_SETUP_REQUIRED",
  ModalPreset
> = {
  DELETE_DATABASE_FILE: {
    title: "Delete Workspace?",
    description:
      "This will permanently delete your database. You can always re-import it later.",
    confirmButton: { text: "Delete", variant: "destructive" },
    cancelButton: { text: "Cancel", variant: "default" },
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
      "You will need to download the models to use the local AI engines.",
    confirmButton: { text: "Go to Settings" },
    cancelButton: { text: "Cancel" },
  },
};

export type ModalContent = keyof typeof MODALS_CONTENT;
