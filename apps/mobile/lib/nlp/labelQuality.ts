export const MAX_SEMANTIC_LABEL_WORDS = 7;
export const MIN_SEMANTIC_LABEL_CHARS = 4;
export const MIN_SOURCE_TEXT_CHARS = 20;

export const hasEnoughTextForSemanticLabel = (text: string): boolean =>
  text.trim().length >= MIN_SOURCE_TEXT_CHARS;

/** Generated headings from short thoughts, or tiny fragments, are not titles. */
export const isDisplayableSemanticLabel = (
  label: string,
  summary = ""
): boolean => {
  const trimmed = label.trim();
  if (!trimmed) return false;
  if (trimmed.length < MIN_SEMANTIC_LABEL_CHARS) return false;
  if (summary && !hasEnoughTextForSemanticLabel(summary)) return false;
  const words = trimmed.split(/\s+/).filter(Boolean);
  if (words.length === 0 || words.length > MAX_SEMANTIC_LABEL_WORDS) {
    return false;
  }
  if (summary && trimmed.toLowerCase() === summary.trim().toLowerCase()) {
    return false;
  }
  return true;
};
