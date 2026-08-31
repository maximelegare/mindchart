import { fbs } from "fbtee";

export function SettingsWorkspacesSectionTitle() {
  return <fbt desc="Settings section: workspaces">Workspaces</fbt>;
}

export function settingsWorkspacesRowLabel() {
  return fbs("Workspaces", "Settings row: workspaces");
}

export function settingsRecoveryPassphraseRowLabel() {
  return fbs("Recovery passphrase", "Settings row: recovery passphrase");
}

export function settingsWorkspaceCreateDescription() {
  return fbs(
    "Each workspace has its own isolated database.",
    "Create workspace sheet description"
  );
}

export function SettingsManageWorkspacesTitle() {
  return <fbt desc="Manage workspaces sheet title">Manage Workspaces</fbt>;
}

export function SettingsManageWorkspacesDescription() {
  return (
    <fbt desc="Manage workspaces sheet description">
      Manage your workspaces here. Each workspace has its seperate database.
    </fbt>
  );
}

export function SettingsActiveWorkspaceHeading() {
  return (
    <fbt desc="Workspaces settings: active workspace heading">
      Active Workspace
    </fbt>
  );
}

export function SettingsAvailableWorkspacesHeading() {
  return (
    <fbt desc="Workspaces settings: available workspaces heading">
      Available Workspaces
    </fbt>
  );
}

export function settingsWorkspaceStatusActive() {
  return fbs("Active", "Workspace status: active");
}

export function settingsWorkspaceStatusLoad() {
  return fbs("Load", "Workspace status: load");
}

export function settingsWorkspaceStatusKeyMissing() {
  return fbs("Key missing", "Workspace status: encryption key missing");
}

export function settingsWorkspaceActionSwitch() {
  return fbs("Switch", "Workspace action: switch");
}

export function settingsWorkspaceActionUnavailable() {
  return fbs("Unavailable", "Workspace action: unavailable");
}

export function settingsWorkspaceUnavailableAlertTitle() {
  return fbs(
    "Workspace unavailable",
    "Alert title when workspace key is missing"
  );
}

export function settingsWorkspaceUnavailableAlertMessage() {
  return fbs(
    "This workspace has no encryption key on this device.",
    "Alert message when workspace key is missing"
  );
}

export function settingsWorkspaceSwitchFailedAlertTitle() {
  return fbs(
    "Could not switch workspace",
    "Alert title when workspace switch fails"
  );
}

export function settingsWorkspaceEditDescription() {
  return fbs(
    "Choose a new name, color, and icon for this workspace.",
    "Edit workspace sheet description"
  );
}

export function settingsExportWorkspaceModalTitle() {
  return fbs("Export Workspace", "Export workspace modal title");
}

export function settingsExportFailedAlertTitle() {
  return fbs("Export failed", "Alert title when workspace export fails");
}

export function settingsExportFailedAlertMessage() {
  return fbs(
    "Could not export this workspace. Please try again.",
    "Alert message when workspace export fails"
  );
}
