import { fbs } from "fbtee";

export type FolderFormMode = "create" | "rename";

export function FolderFormTitle({ mode }: { mode: FolderFormMode }) {
  if (mode === "create") {
    return <fbt desc="Folder form title: new folder">New folder</fbt>;
  }

  return <fbt desc="Folder form title: rename folder">Rename folder</fbt>;
}

export function folderBreadcrumbRootLabel() {
  return fbs("Root", "Breadcrumb label for root folder");
}

export function folderNestingLimitErrorMessage() {
  return fbs(
    "Folders can only be nested 3 levels deep.",
    "Error when folder nesting exceeds maximum depth"
  );
}

export function folderFormMaximumDepthAlertTitle() {
  return fbs("Maximum depth", "Alert title when folder nesting limit reached");
}

export function FolderFormNameLabel() {
  return <fbt desc="Folder form field label: name">Name</fbt>;
}

export function folderFormNamePlaceholder() {
  return fbs("Folder name", "Folder form name input placeholder");
}

export function folderFormNameRequiredError() {
  return fbs("Name is required", "Folder form validation: name required");
}

export function FolderFormCancelLabel() {
  return <fbt desc="Folder form cancel button">Cancel</fbt>;
}

export function FolderFormCreateButtonLabel() {
  return <fbt desc="Folder form create button">Create</fbt>;
}

export function FolderFormSaveButtonLabel() {
  return <fbt desc="Folder form save button">Save</fbt>;
}

export function FolderFormCreatingButtonLabel() {
  return <fbt desc="Folder form creating in progress">Creating…</fbt>;
}

export function FolderFormSavingButtonLabel() {
  return <fbt desc="Folder form saving in progress">Saving…</fbt>;
}

export function folderFormCreateFailedAlertTitle() {
  return fbs("Create failed", "Alert title when folder creation fails");
}

export function folderFormRenameFailedAlertTitle() {
  return fbs("Rename failed", "Alert title when folder rename fails");
}
