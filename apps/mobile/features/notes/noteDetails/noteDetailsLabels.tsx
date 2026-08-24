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

export function NoteDetailsCompleteViewLabel() {
  return <fbt desc="Note details view mode: complete">Complete View</fbt>;
}

export function NoteDetailsSimplifiedViewLabel() {
  return <fbt desc="Note details view mode: simplified">Simplified View</fbt>;
}

export function NoteDetailsTitlePlaceholder() {
  return fbs("Enter a title", "Note details title input placeholder");
}

export function noteDetailsTitleRequiredPlaceholder() {
  return fbs("Title is required", "Note details title validation placeholder");
}

export function DiscardNoteDeleteLabel() {
  return <fbt desc="Discard note button: delete preview note">Delete</fbt>;
}

export function DiscardNoteDiscardLabel() {
  return <fbt desc="Discard note button: discard editing note">Discard</fbt>;
}

export function noteDetailsDeleteNoteAccessibilityLabel() {
  return fbs(
    "Delete note",
    "Accessibility label for delete note button in preview"
  );
}

export function noteDetailsDiscardNoteAccessibilityLabel() {
  return fbs(
    "Discard note",
    "Accessibility label for discard note button while editing"
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

export function getDiscardNoteAccessibilityLabel(
  variant: "delete" | "discard"
): string {
  return variant === "delete"
    ? noteDetailsDeleteNoteAccessibilityLabel()
    : noteDetailsDiscardNoteAccessibilityLabel();
}
