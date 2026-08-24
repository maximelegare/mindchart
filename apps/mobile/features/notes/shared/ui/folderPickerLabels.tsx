import { fbs } from "fbtee";

export function FolderPickerMoveSheetTitle() {
  return <fbt desc="Folder picker sheet default title">Move to…</fbt>;
}

export function FolderPickerMoveHeaderLabel() {
  return <fbt desc="Folder picker move header prefix">Move:</fbt>;
}

export function FolderPickerFoldersTitle() {
  return <fbt desc="Folder selector sheet title">Folders</fbt>;
}

export function FolderPickerLocationLabel() {
  return <fbt desc="Folder picker location panel title">Location</fbt>;
}

export function FolderPickerContentLabel() {
  return <fbt desc="Folder picker content panel title">Content</fbt>;
}

export function FolderPickerEmptyFolderLabel() {
  return <fbt desc="Folder picker empty folder message">Empty folder</fbt>;
}

export function FolderPickerConfirmFromLabel() {
  return <fbt desc="Folder picker confirm button: from">from</fbt>;
}

export function FolderPickerConfirmToLabel() {
  return <fbt desc="Folder picker confirm button: to">to</fbt>;
}

export function folderPickerNoFolderLabel() {
  return fbs("No folder", "Folder picker option for no folder");
}

export function folderPickerSelectFolderLabel() {
  return fbs("Select a folder", "Folder picker prompt when root is disabled");
}

export function folderPickerMoveToRootLabel() {
  return fbs("Move to root", "Folder picker root option when moving folders");
}

export function folderBreadcrumbRootLabel() {
  return fbs("Root", "Breadcrumb label for root folder");
}

export function folderPickerSelectActionVerb() {
  return fbs("Select", "Folder picker confirm button verb for selection");
}

export function folderPickerMoveIntoActionVerb() {
  return fbs("Move into", "Folder picker confirm button verb for move");
}

export function folderPickerHideContentPanelLabel() {
  return fbs(
    "Hide content panel",
    "Accessibility label to hide folder picker content panel"
  );
}

export function folderPickerShowContentPanelLabel() {
  return fbs(
    "Show content panel",
    "Accessibility label to show folder picker content panel"
  );
}

export function folderPickerNoteUntitledLabel() {
  return fbs("Untitled", "Fallback title for note in folder picker");
}

export function folderPickerNoteKindLabel() {
  return fbs("note", "Noun used in folder picker note accessibility label");
}

export function folderPickerNoteAccessibilityLabel(
  title: string,
  kindLabel: string
) {
  return `${title}, ${kindLabel}`;
}
