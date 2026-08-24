import { fbs } from "fbtee";

export function EditNoteSheetTitle() {
  return <fbt desc="Note bottom sheet edit view title">Edit Note</fbt>;
}

export function EditNoteActionLabel() {
  return <fbt desc="Note bottom sheet action: edit note">Edit note</fbt>;
}

export function MoveNoteActionLabel() {
  return <fbt desc="Note bottom sheet action: move note">Move note</fbt>;
}

export function DeleteNoteActionLabel() {
  return <fbt desc="Note bottom sheet action: delete note">Delete note</fbt>;
}

export function noteMoveFailedAlertTitle() {
  return fbs("Move failed", "Alert title when moving a note fails");
}

export function noteDeleteFailedAlertTitle() {
  return fbs("Delete failed", "Alert title when deleting a note fails");
}
