export class WorkspaceExportInvalidArchiveError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "WorkspaceExportInvalidArchiveError";
  }
}

export class WorkspaceExportDecryptError extends Error {
  constructor(message = "Wrong password or corrupted export metadata") {
    super(message);
    this.name = "WorkspaceExportDecryptError";
  }
}
