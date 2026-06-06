export const WORKSPACE_IMPORT_WRONG_PASSWORD_MESSAGE =
  "Incorrect password or recovery passphrase. Enter the export password you used when exporting, or the recovery passphrase you saved in settings.";

export class WorkspaceExportInvalidArchiveError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "WorkspaceExportInvalidArchiveError";
  }
}

export class WorkspaceExportDecryptError extends Error {
  constructor(message = WORKSPACE_IMPORT_WRONG_PASSWORD_MESSAGE) {
    super(message);
    this.name = "WorkspaceExportDecryptError";
  }
}

/** `instanceof` can fail across Metro bundles; also match by `name`. */
export const isWorkspaceExportDecryptError = (
  error: unknown
): error is WorkspaceExportDecryptError =>
  error instanceof WorkspaceExportDecryptError ||
  (error instanceof Error && error.name === "WorkspaceExportDecryptError");

export const isWorkspaceExportInvalidArchiveError = (
  error: unknown
): error is WorkspaceExportInvalidArchiveError =>
  error instanceof WorkspaceExportInvalidArchiveError ||
  (error instanceof Error &&
    error.name === "WorkspaceExportInvalidArchiveError");

export const getWorkspaceImportErrorMessage = (error: unknown): string => {
  if (isWorkspaceExportDecryptError(error)) {
    return WORKSPACE_IMPORT_WRONG_PASSWORD_MESSAGE;
  }
  if (isWorkspaceExportInvalidArchiveError(error)) {
    return error.message;
  }
  if (error instanceof Error && error.message) {
    return error.message;
  }
  return "Import failed. Please try again.";
};
