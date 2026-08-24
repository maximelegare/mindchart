import { fbs } from "fbtee";

export function FloatingMenuAiGeneratedLabel() {
  return (
    <fbt desc="Floating create menu: AI generated note">AI Generated...</fbt>
  );
}

export function floatingMenuDismissAccessibilityLabel() {
  return fbs(
    "Dismiss create menu",
    "Accessibility label to dismiss floating create menu"
  );
}

export function floatingMenuCreateAccessibilityLabel() {
  return fbs(
    "Create",
    "Accessibility label for floating create button when closed"
  );
}

export function floatingMenuCloseAccessibilityLabel() {
  return fbs(
    "Close create menu",
    "Accessibility label for floating create button when open"
  );
}

export function floatingMenuNewNoteAccessibilityLabel() {
  return fbs(
    "New note",
    "Accessibility label for floating menu new note action"
  );
}

export function floatingMenuNewFolderAccessibilityLabel() {
  return fbs(
    "New folder",
    "Accessibility label for floating menu new folder action"
  );
}

export function floatingMenuAiGeneratedAccessibilityLabel() {
  return fbs(
    "AI Generated",
    "Accessibility label for floating menu AI generated note action"
  );
}
