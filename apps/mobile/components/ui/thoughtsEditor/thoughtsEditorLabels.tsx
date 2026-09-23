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

export function ThoughtsEditorTitleModalTitle() {
  return <fbt desc="Thought title modal heading">Title</fbt>;
}

export function ThoughtsEditorTitleCancelLabel() {
  return <fbt desc="Thought title modal cancel button">Cancel</fbt>;
}

export function ThoughtsEditorTitleSaveLabel() {
  return <fbt desc="Thought title modal save button">Save</fbt>;
}

export function thoughtsEditorCategoryLabel() {
  return fbs("Category", "Thought editor toolbar category field label");
}

export function thoughtsEditorCategoryAccessibilityLabel() {
  return fbs(
    "Thought category",
    "Accessibility label for thought category button in the editor toolbar"
  );
}

export function thoughtsEditorHideCategoriesAccessibilityLabel() {
  return fbs(
    "Hide categories",
    "Accessibility label to hide thought category colors"
  );
}

export function thoughtsEditorShowCategoriesAccessibilityLabel() {
  return fbs(
    "Show categories",
    "Accessibility label to show thought category colors"
  );
}

export function thoughtsEditorCategoryOpacityAccessibilityLabel() {
  return fbs(
    "Adjust category opacity",
    "Accessibility label for long-press category opacity slider"
  );
}

export function thoughtsEditorCategoryOpacityLabel() {
  return fbs(
    "Category opacity",
    "Thought editor category opacity slider label"
  );
}

export function thoughtsEditorDetailsMoreOptionsAccessibilityLabel() {
  return fbs(
    "More category tools",
    "Accessibility label to show the next category toolbar options"
  );
}

export function thoughtsEditorDetailsTitleCategoryAccessibilityLabel() {
  return fbs(
    "Title and category",
    "Accessibility label to return to title and category toolbar options"
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
