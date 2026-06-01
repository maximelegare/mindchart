export class WorkspaceEncryptionKeyMissingError extends Error {
  constructor() {
    super(
      "Workspace encryption key is not set. Call setWorkspaceEncryptionKey before opening the database."
    );
    this.name = "WorkspaceEncryptionKeyMissingError";
  }
}
