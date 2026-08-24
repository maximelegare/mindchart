import { fbs, fbt } from "fbtee";

export function workspaceImportModalTitle() {
  return fbs("Import Workspace", "Import workspace flow modal title");
}

export function workspaceImportNewWorkspaceModalTitle() {
  return fbs(
    "New Workspace",
    "Import workspace flow: new workspace step title"
  );
}

export function workspaceImportOverwriteModalTitle() {
  return fbs(
    "Overwrite workspace?",
    "Import workspace flow: overwrite confirmation title"
  );
}

export function workspaceImportFailedAlertTitle() {
  return fbs("Import failed", "Alert title when workspace import fails");
}

export function workspaceImportReadingExportTitle() {
  return fbs(
    "Reading export...",
    "Import workspace flow: reading export loading title"
  );
}

export function workspaceImportReadingExportDescription() {
  return fbs(
    "Unpacking your workspace file.",
    "Import workspace flow: reading export loading description"
  );
}

export function workspaceImportDecryptingTitle() {
  return fbs(
    "Decrypting workspace...",
    "Import workspace flow: decrypting loading title"
  );
}

export function workspaceImportDecryptingDescription() {
  return fbs(
    "This can take up to a minute. Please keep the app open.",
    "Import workspace flow: decrypting loading description"
  );
}

export function workspaceImportApplyingTitle() {
  return fbs(
    "Importing workspace...",
    "Import workspace flow: applying loading title"
  );
}

export function workspaceImportApplyingDescription() {
  return fbs(
    "Writing database and activating workspace.",
    "Import workspace flow: applying loading description"
  );
}

export function workspaceImportNewWorkspaceDescription() {
  return fbs(
    "Name your imported workspace and choose an icon and color.",
    "Import workspace flow: new workspace form description"
  );
}

export function workspaceImportDefaultName() {
  return fbs(
    "Imported Workspace",
    "Import workspace flow: default workspace name"
  );
}

export function workspaceImportActiveWorkspaceFallbackName() {
  return fbs(
    "this workspace",
    "Import workspace flow: fallback active workspace name"
  );
}

export function WorkspaceImportOverwriteDescription({
  workspaceName,
}: {
  workspaceName: string;
}) {
  return (
    <fbt desc="Import workspace flow: overwrite confirmation description">
      All notes and data in &quot;
      <fbt:param name="workspaceName">{workspaceName}</fbt:param>
      &quot; will be permanently replaced with the contents of this import. Your
      current workspace name, icon, and color will stay the same. This cannot be
      undone.
    </fbt>
  );
}

export function workspaceImportUseRecoveryPassphraseLink() {
  return fbs(
    "Use recovery passphrase instead",
    "Import workspace flow: switch to recovery passphrase"
  );
}

export function workspaceImportUseExportPasswordLink() {
  return fbs(
    "Use export password instead",
    "Import workspace flow: switch to export password"
  );
}

export function workspaceImportChoiceDescription() {
  return fbs(
    "Create a new workspace from this file, or overwrite the currently active workspace?",
    "Import workspace flow: import choice description"
  );
}

export function workspaceImportNewWorkspaceButton() {
  return fbs("New workspace", "Import workspace flow: new workspace button");
}

export function workspaceImportOverwriteActiveButton() {
  return fbs(
    "Overwrite active",
    "Import workspace flow: overwrite active button"
  );
}

export function workspaceImportOverwriteConfirmButton() {
  return fbs("Overwrite", "Import workspace flow: overwrite confirm button");
}

export function workspaceExportPasswordDescription() {
  return fbs(
    "Choose a password to protect this export. You will need it to import the workspace later.",
    "Export workspace password modal description"
  );
}

export function workspaceImportPasswordDescription() {
  return fbs(
    "Enter the password you used when exporting this workspace.",
    "Import workspace password modal description"
  );
}

export function workspaceImportRecoveryDescription() {
  return fbs(
    "Enter the recovery passphrase you chose when you enabled recovery passphrase.",
    "Import workspace recovery passphrase modal description"
  );
}

export function workspaceExportConfirmLabel() {
  return fbs("Export", "Export workspace password modal confirm button");
}

export function workspaceImportConfirmLabel() {
  return fbs("Import", "Import workspace password modal confirm button");
}

export function workspacePasswordFieldLabel() {
  return fbs("Password", "Workspace password modal field label");
}

export function workspaceExportPasswordPlaceholder() {
  return fbs("Export password", "Export workspace password field placeholder");
}

export function workspaceConfirmPasswordLabel() {
  return fbs("Confirm password", "Export workspace confirm password label");
}

export function workspaceConfirmPasswordPlaceholder() {
  return fbs(
    "Confirm password",
    "Export workspace confirm password placeholder"
  );
}

export function workspacePasswordMinLengthError(min: number) {
  return fbs(
    ["At least ", fbs.param("min", min.toString()), " characters"],
    "Workspace password minimum length validation"
  );
}

export function workspacePasswordMismatchError() {
  return fbs(
    "Passwords do not match",
    "Workspace password mismatch validation"
  );
}

export function workspacePasswordRequiredError() {
  return fbs(
    "Password is required",
    "Import workspace password required validation"
  );
}

export function workspaceRecoveryPassphraseFieldLabel() {
  return fbs(
    "Recovery passphrase",
    "Import workspace recovery passphrase field label"
  );
}

export function workspaceRecoveryPassphrasePlaceholder() {
  return fbs(
    "Recovery passphrase",
    "Import workspace recovery passphrase placeholder"
  );
}

export function workspaceRecoveryPassphraseRequiredError() {
  return fbs(
    "Recovery passphrase is required",
    "Import workspace recovery passphrase required validation"
  );
}

export function workspaceExportingButtonLabel() {
  return fbs("Exporting…", "Export workspace password modal submitting state");
}

export function workspaceImportingButtonLabel() {
  return fbs("Importing…", "Import workspace password modal submitting state");
}
