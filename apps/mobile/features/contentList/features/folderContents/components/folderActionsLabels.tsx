import { fbs } from "fbtee";

export function FolderActionsNewFolderLabel() {
  return <fbt desc="Folder form title: new folder">New folder</fbt>;
}

export function FolderActionsNewNoteLabel() {
  return <fbt desc="Folder actions: create note in folder">New note</fbt>;
}

export function FolderActionsRenameLabel() {
  return <fbt desc="Folder actions: rename folder">Rename</fbt>;
}

export function FolderActionsMoveLabel() {
  return <fbt desc="Folder actions: move folder">Move</fbt>;
}

export function FolderActionsDeleteLabel() {
  return <fbt desc="Folder actions: delete folder">Delete</fbt>;
}

export function folderActionsFolderFallbackLabel() {
  return fbs("Folder", "Fallback label when folder has no name");
}

export function folderMoveFailedAlertTitle() {
  return fbs("Move failed", "Alert title when moving a folder fails");
}
