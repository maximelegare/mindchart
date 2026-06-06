export class WorkspaceKeyMissingError extends Error {
  readonly workspaceId: string;

  constructor(workspaceId: string) {
    super(`No encryption key found for workspace ${workspaceId}`);
    this.name = "WorkspaceKeyMissingError";
    this.workspaceId = workspaceId;
  }
}

export class WorkspaceRecoveryError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "WorkspaceRecoveryError";
  }
}
