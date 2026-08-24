import { fbs } from "fbtee";

export function ThoughtsEditorContentLabel() {
  return <fbt desc="Thoughts editor field label">Content</fbt>;
}

export function ThoughtsEditorClearLabel() {
  return <fbt desc="Thoughts editor clear content button">Clear</fbt>;
}

export function ThoughtsEditorTitlesToggleLabel() {
  return <fbt desc="Thoughts editor show titles toggle">Titles</fbt>;
}

export function thoughtsEditorShowTitlesAccessibilityLabel() {
  return fbs(
    "Show thought titles",
    "Accessibility label for show thought titles switch"
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
