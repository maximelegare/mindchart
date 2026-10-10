import { fbs } from "fbtee";

export function noteDetailsNoteSubtitle() {
  return fbs("Note", "Note details page subtitle");
}

export function noteDetailsDeleteNoteMenuLabel() {
  return fbs("Delete Note", "Note details menu: delete note");
}

export function noteDetailsSettingsMenuLabel() {
  return fbs("Settings", "Note details menu: settings");
}

export function NoteDetailsViewModeChipLabel({
  simplified,
}: {
  simplified: boolean;
}) {
  if (simplified) {
    return (
      <fbt desc="Note details view mode: hide categories">Hide Categories</fbt>
    );
  }

  return (
    <fbt desc="Note details view mode: show categories">Show Categories</fbt>
  );
}

export function NoteDetailsTitlePlaceholder() {
  return fbs("Enter a title", "Note details title input placeholder");
}

export function noteDetailsTitleRequiredPlaceholder() {
  return fbs("Title is required", "Note details title validation placeholder");
}

export function noteDetailsDeleteNoteAccessibilityLabel() {
  return fbs(
    "Don't save note",
    "Accessibility label for deny button on a new or preview note"
  );
}

export function noteDetailsDiscardNoteAccessibilityLabel() {
  return fbs(
    "Discard changes",
    "Accessibility label for deny button while editing an existing note"
  );
}

export function RawTextButtonLabel() {
  return <fbt desc="Note details raw text viewer trigger">Raw Text</fbt>;
}

export function RawTextSheetTitle() {
  return (
    <fbt desc="Note details raw text sheet title">Raw Text (Original text)</fbt>
  );
}

export function noteDetailsFolderRequiredAlertTitle() {
  return fbs("Folder required", "Alert title when note must be in a folder");
}

export function noteDetailsFolderRequiredAlertMessage() {
  return fbs(
    "Notes must be saved in a folder. Root is not allowed.",
    "Alert message when note must be in a folder"
  );
}

export function noteDetailsUpdateFailedAlertTitle() {
  return fbs("Update failed", "Alert title when note attribute update fails");
}

export function EditNoteSaveAccessibilityLabel() {
  return fbs("Save note", "Accessibility label for save note button");
}

export function EditNoteEditAccessibilityLabel() {
  return fbs("Edit note", "Accessibility label for edit note button");
}

export function noteDetailsSavedToastTitle() {
  return fbs("Note saved", "Toast title after a note finishes saving");
}

export function noteDetailsSaveFailedToastTitle() {
  return fbs("Couldn't save note", "Toast title when note save fails");
}

export function noteDetailsLoadingNoteTitle() {
  return fbs(
    "Loading note",
    "Note details loading title while a save is pending"
  );
}

export function getDiscardNoteAccessibilityLabel(
  variant: "delete" | "discard"
): string {
  return variant === "delete"
    ? noteDetailsDeleteNoteAccessibilityLabel()
    : noteDetailsDiscardNoteAccessibilityLabel();
}
