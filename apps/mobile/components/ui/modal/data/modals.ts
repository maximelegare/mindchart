export const MODALS_CONTENT = {
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
};

export type ModalContent = keyof typeof MODALS_CONTENT;
