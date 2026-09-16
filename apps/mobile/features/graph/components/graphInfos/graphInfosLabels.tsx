import { fbs } from "fbtee";

export function graphInfosTreeViewAccessibilityLabel() {
  return fbs(
    "Show folder tree",
    "Graph infos: tree view toggle accessibility label"
  );
}

export function graphInfosNotesViewAccessibilityLabel() {
  return fbs(
    "Show notes list",
    "Graph infos: notes list view toggle accessibility label"
  );
}

export function GraphInfosNotesEmptyLabel() {
  return (
    <fbt desc="Graph infos notes list empty state">
      No notes in this directory.
    </fbt>
  );
}
