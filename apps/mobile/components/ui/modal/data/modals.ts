export const MODALS_CONTENT = {
  DELETE_DATABASE_FILE: {
    title: "Delete Workspace?",
    description:
      "This will permanently delete your database. You can always re-import it later.",
    confirmText: "Delete",
    cancelText: "Cancel",
  },
  INITIALIZE_MODEL_ERROR: {
    title: "Failed to initialize LLM.",
    description: "You will need to download it again to use it.",
    confirmText: "Ok",
    cancelText: "Cancel",
  },
  DELETE_MODEL_ERROR: {
    title: "Failed to delete model entirely.",
    description: "You will need to download it again to use it.",
    confirmText: "Delete",
    cancelText: "Cancel",
  },
  DELETE_MODEL_ACTION: {
    title: "Are you sure you want to remove this model?",
    description: "You will need to download it again to use it.",
    confirmText: "Delete",
    cancelText: "Cancel",
  },
  AI_SETUP_REQUIRED: {
    title: "AI Setup Required",
    description:
      "You will need to download the models to use the local AI engines.",
    confirmText: "Go to Settings",
    cancelText: "Cancel",
  },
};

export type ModalContent = keyof typeof MODALS_CONTENT;
