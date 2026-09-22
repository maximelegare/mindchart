import { fbs } from "fbtee";

export function ThoughtsEditorContentLabel() {
  return <fbt desc="Thoughts editor field label">Content</fbt>;
}

export function ThoughtsEditorTitlesToggleLabel() {
  return <fbt desc="Thoughts editor show titles toggle">Titles</fbt>;
}

export function thoughtsEditorBoldAccessibilityLabel() {
  return fbs("Bold", "Accessibility label for bold formatting button");
}

export function thoughtsEditorItalicAccessibilityLabel() {
  return fbs("Italic", "Accessibility label for italic formatting button");
}

export function thoughtsEditorUnderlineAccessibilityLabel() {
  return fbs(
    "Underline",
    "Accessibility label for underline formatting button"
  );
}

export function thoughtsEditorShowTitlesAccessibilityLabel() {
  return fbs(
    "Show thought titles",
    "Accessibility label for show thought titles switch"
  );
}

export function thoughtsEditorBulletAccessibilityLabel() {
  return fbs(
    "Bullet list",
    "Accessibility label for bullet thought type button"
  );
}

export function thoughtsEditorTextAccessibilityLabel() {
  return fbs("Text block", "Accessibility label for text thought type button");
}

export function thoughtsEditorChecklistAccessibilityLabel() {
  return fbs(
    "Checklist",
    "Accessibility label for checklist thought type button"
  );
}

export function thoughtsEditorDetailsToolbarAccessibilityLabel() {
  return fbs(
    "Title and category toolbar",
    "Accessibility label to switch to the title and category toolbar"
  );
}

export function thoughtsEditorFormatToolbarAccessibilityLabel() {
  return fbs(
    "Formatting toolbar",
    "Accessibility label to switch to the formatting toolbar"
  );
}

export function thoughtsEditorTitlePlaceholder() {
  return fbs("Title", "Thought editor toolbar title field placeholder");
}

export function thoughtsEditorTitleLabel() {
  return fbs("Title", "Thought editor toolbar title field label");
}

export function thoughtsEditorEditTitleAccessibilityLabel() {
  return fbs(
    "Edit thought title",
    "Accessibility label for the edit thought title pencil button"
  );
}

export function thoughtsEditorNoTitleYet() {
  return fbs("No title yet", "Thought editor empty title placeholder");
}

export function thoughtsEditorCategoryAccessibilityLabel() {
  return fbs(
    "Thought category",
    "Accessibility label for thought category button in the editor toolbar"
  );
}

export function thoughtsEditorGraphAccessibilityLabel() {
  return fbs(
    "Open thought graph",
    "Accessibility label for open thought graph button in the editor toolbar"
  );
}

export type ThoughtFieldPlaceholders = {
  title: string;
  summary: string;
  bullet: string;
  titleRequired: string;
  summaryRequired: string;
  emptyBullet: string;
};

export function getThoughtFieldPlaceholders(): ThoughtFieldPlaceholders {
  return {
    title: fbs("Title", "Thought editor title field placeholder"),
    summary: fbs("Summary", "Thought editor summary field placeholder"),
    bullet: fbs(
      "Enter a bullet point",
      "Thought editor bullet field placeholder"
    ),
    titleRequired: fbs(
      "Title is required",
      "Thought editor title required validation"
    ),
    summaryRequired: fbs(
      "Summary is required",
      "Thought editor summary required validation"
    ),
    emptyBullet: fbs(
      "Add at least one bullet point",
      "Thought editor empty content validation"
    ),
  };
}

export function buildThoughtPlaceholdersScript(
  placeholders: ThoughtFieldPlaceholders
): string {
  return `window.__mcPlaceholders = ${JSON.stringify(placeholders)}; true;`;
}
