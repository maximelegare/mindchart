import { fbs } from "fbtee";
import type { ModalPreset } from "./modals";
import type { ModalContent } from "./modals";

export function modalDefaultConfirmLabel() {
  return fbs("Confirm", "Modal default confirm button");
}

export function modalDefaultCancelLabel() {
  return fbs("Cancel", "Modal default cancel button");
}

export function modalOkLabel() {
  return fbs("Ok", "Modal OK button");
}

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

export function getDiscardUnsavedNoteModal(): ModalPreset {
  return {
    title: fbs(
      "Discard this note?",
      "Discard unsaved note confirmation modal title"
    ),
    description: fbs(
      "This note will not be saved.",
      "Discard unsaved note confirmation modal description"
    ),
    confirmButton: {
      text: fbs("Discard", "Discard unsaved note confirmation confirm button"),
      variant: "destructive",
    },
    cancelButton: {
      text: fbs("Cancel", "Discard unsaved note confirmation cancel button"),
      variant: "default",
    },
  };
}

export function getDiscardNoteChangesModal(): ModalPreset {
  return {
    title: fbs(
      "Discard changes?",
      "Discard note edits confirmation modal title"
    ),
    description: fbs(
      "Your unsaved edits will be lost.",
      "Discard note edits confirmation modal description"
    ),
    confirmButton: {
      text: fbs("Discard", "Discard note edits confirmation confirm button"),
      variant: "destructive",
    },
    cancelButton: {
      text: fbs("Cancel", "Discard note edits confirmation cancel button"),
      variant: "default",
    },
  };
}

export function getDeleteWorkspaceConfirmationModal(): ModalPreset {
  return {
    title: fbs(
      "Delete Workspace?",
      "Delete workspace confirmation modal title"
    ),
    description: fbs(
      "This will permanently delete this workspace's database. You can always re-import it later.",
      "Delete workspace confirmation modal description"
    ),
    confirmButton: {
      text: fbs("Delete", "Delete workspace confirmation confirm button"),
      variant: "destructive",
    },
    cancelButton: {
      text: fbs("Cancel", "Delete workspace confirmation cancel button"),
      variant: "default",
    },
  };
}

export function getImportWorkspaceChoiceModal(): ModalPreset {
  return {
    title: fbs("Import Workspace", "Import workspace choice modal title"),
    description: fbs(
      "Create a new workspace from this file, or overwrite the currently active workspace?",
      "Import workspace choice modal description"
    ),
    confirmButton: {
      text: fbs("New workspace", "Import workspace choice confirm button"),
      variant: "default",
    },
    cancelButton: {
      text: fbs("Overwrite active", "Import workspace choice cancel button"),
      variant: "destructive",
    },
  };
}

export function getInitializeModelErrorModal(): ModalPreset {
  return {
    title: fbs(
      "Failed to initialize LLM.",
      "Initialize model error modal title"
    ),
    description: fbs(
      "You will need to download it again to use it.",
      "Initialize model error modal description"
    ),
    confirmButton: { text: modalOkLabel() },
    cancelButton: {
      text: fbs("Cancel", "Initialize model error modal cancel button"),
    },
  };
}

export function getDeleteModelErrorModal(): ModalPreset {
  return {
    title: fbs(
      "Failed to delete model entirely.",
      "Delete model error modal title"
    ),
    description: fbs(
      "You will need to download it again to use it.",
      "Delete model error modal description"
    ),
    confirmButton: {
      text: fbs("Delete", "Delete model error modal confirm button"),
    },
    cancelButton: {
      text: fbs("Cancel", "Delete model error modal cancel button"),
    },
  };
}

export function getDeleteModelActionModal(): ModalPreset {
  return {
    title: fbs(
      "Are you sure you want to remove this model?",
      "Delete model action modal title"
    ),
    description: fbs(
      "You will need to download it again to use it.",
      "Delete model action modal description"
    ),
    confirmButton: {
      text: fbs("Delete", "Delete model action modal confirm button"),
      variant: "destructive",
    },
    cancelButton: {
      text: fbs("Cancel", "Delete model action modal cancel button"),
      variant: "default",
    },
  };
}

export function getAiSetupRequiredModal(): ModalPreset {
  return {
    title: fbs("AI Setup Required", "AI setup required modal title"),
    description: fbs(
      "You will need to download an embeddings model to use local AI features. Go to Settings to set it up.",
      "AI setup required modal description"
    ),
    confirmButton: {
      text: fbs("Go to Settings", "AI setup required modal confirm button"),
    },
    cancelButton: {
      text: fbs("Cancel", "AI setup required modal cancel button"),
    },
  };
}

export function getDisableRecoveryPasswordModal(): ModalPreset {
  return {
    title: fbs(
      "Disable recovery passphrase",
      "Disable recovery passphrase modal title"
    ),
    description: fbs(
      "This deletes your recovery passphrase. Exports made with recovery enabled won't unlock with recovery unless you remember the passphrase you chose.",
      "Disable recovery passphrase modal description"
    ),
    confirmButton: {
      text: fbs("Disable", "Disable recovery passphrase modal confirm button"),
      variant: "destructive",
    },
    cancelButton: {
      text: fbs("Cancel", "Disable recovery passphrase modal cancel button"),
      variant: "default",
    },
  };
}

export function getBiometricsUnavailableModal(): ModalPreset {
  return {
    title: fbs("Biometrics unavailable", "Biometrics unavailable modal title"),
    description: fbs(
      "Use a device with Face ID or fingerprint enrolled, and a development build (not Expo Go).",
      "Biometrics unavailable modal description"
    ),
    confirmButton: {
      text: modalOkLabel(),
      variant: "default",
    },
    cancelButton: {
      text: fbs("Cancel", "Biometrics unavailable modal cancel button"),
      variant: "default",
    },
  };
}

export function getClearSeedDataModal(): ModalPreset {
  return {
    title: fbs("Clear seed data?", "Clear seed data confirmation modal title"),
    description: fbs(
      "This deletes all notes, thoughts, and nested folders. Root folders will be kept.",
      "Clear seed data confirmation modal description"
    ),
    confirmButton: {
      text: fbs("Clear seed", "Clear seed data confirmation confirm button"),
      variant: "destructive",
    },
    cancelButton: {
      text: fbs("Cancel", "Clear seed data confirmation cancel button"),
      variant: "default",
    },
  };
}

export function getDeleteLocationConfirmationModal(): ModalPreset {
  return {
    title: fbs("Remove Location?", "Delete location confirmation modal title"),
    description: fbs(
      "This will remove this location from all notes that use it.",
      "Delete location confirmation modal description"
    ),
    confirmButton: {
      text: fbs("Remove", "Delete location confirmation confirm button"),
      variant: "destructive",
    },
    cancelButton: {
      text: fbs("Cancel", "Delete location confirmation cancel button"),
      variant: "default",
    },
  };
}

export function getDeleteDatabaseFileModal(): ModalPreset {
  return {
    title: fbs("Delete Workspace?", "Delete database file modal title"),
    description: fbs(
      "This will permanently delete your database. You can always re-import it later.",
      "Delete database file modal description"
    ),
    confirmButton: {
      text: fbs("Delete", "Delete database file modal confirm button"),
      variant: "destructive",
    },
    cancelButton: {
      text: fbs("Cancel", "Delete database file modal cancel button"),
      variant: "default",
    },
  };
}

const TRANSLATED_MODALS: Partial<Record<ModalContent, () => ModalPreset>> = {
  DELETE_NOTE_CONFIRMATION: getDeleteNoteConfirmationModal,
  DISCARD_UNSAVED_NOTE: getDiscardUnsavedNoteModal,
  DISCARD_NOTE_CHANGES: getDiscardNoteChangesModal,
  DELETE_FOLDER_CONFIRMATION: getDeleteFolderConfirmationModal,
  DELETE_WORKSPACE: getDeleteWorkspaceConfirmationModal,
  IMPORT_WORKSPACE_CHOICE: getImportWorkspaceChoiceModal,
  INITIALIZE_MODEL_ERROR: getInitializeModelErrorModal,
  DELETE_MODEL_ERROR: getDeleteModelErrorModal,
  DELETE_MODEL_ACTION: getDeleteModelActionModal,
  AI_SETUP_REQUIRED: getAiSetupRequiredModal,
  DISABLE_RECOVERY_PASSWORD: getDisableRecoveryPasswordModal,
  BIOMETRICS_UNAVAILABLE: getBiometricsUnavailableModal,
  DELETE_DATABASE_FILE: getDeleteDatabaseFileModal,
  DELETE_LOCATION_CONFIRMATION: getDeleteLocationConfirmationModal,
  CLEAR_SEED_DATA: getClearSeedDataModal,
};

export function getTranslatedModalPreset(
  modalName: ModalContent
): ModalPreset | undefined {
  return TRANSLATED_MODALS[modalName]?.();
}
