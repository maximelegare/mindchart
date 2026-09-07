import { fbs, fbt } from "fbtee";

export function searchPageTitle() {
  return fbs("Search", "Search sheet header title");
}

export function searchPlaceholder() {
  return fbs("Search", "Search input placeholder");
}

export function searchOptionsAccessibilityLabel() {
  return fbs("Search options", "Accessibility label for search options chip");
}

export function searchTranscriptToggleLabel() {
  return fbs(
    "Original transcript",
    "Search toggle: include original transcript"
  );
}

export function SearchResultsFoundLabel({ count }: { count: number }) {
  return (
    <fbt desc="Search results count">
      <fbt:param name="count">{count}</fbt:param> results found
    </fbt>
  );
}

export function searchUntitledNoteLabel() {
  return fbs("Untitled Note", "Search result fallback note title");
}

export function searchTranscriptMatchLabel() {
  return fbs("Transcript", "Search result transcript snippet label");
}
