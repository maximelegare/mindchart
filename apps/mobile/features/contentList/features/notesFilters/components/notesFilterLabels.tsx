import { fbs } from "fbtee";
import type { ReactNode } from "react";

export function FiltersChipLabel({ activeCount }: { activeCount: number }) {
  if (activeCount > 0) {
    return (
      <fbt desc="Notes filter chip with active filter count">
        Filters (<fbt:param name="count">{activeCount}</fbt:param>)
      </fbt>
    );
  }

  return <fbt desc="Notes filter chip">Filters</fbt>;
}

export function FiltersSheetTitle() {
  return <fbt desc="Notes filter sheet title">Filters</fbt>;
}

export function FilterFolderLabel() {
  return <fbt desc="Notes filter row: folder">Folder</fbt>;
}

export function FilterPeopleLabel() {
  return <fbt desc="Notes filter row: people">People</fbt>;
}

export function FilterFeelingLabel() {
  return <fbt desc="Notes filter row: feeling">Feeling</fbt>;
}

export function FilterLocationLabel() {
  return <fbt desc="Notes filter row: location">Location</fbt>;
}

export function ClearFiltersLabel() {
  return <fbt desc="Notes filter sheet: clear all filters">Clear filters</fbt>;
}

export function FilterPickerDoneLabel() {
  return <fbt desc="Notes filter picker: done button">Done</fbt>;
}

export function FilterSummaryAnyLabel() {
  return <fbt desc="Notes filter summary: no restriction">Any</fbt>;
}

export function FilterOneSelectedSummary() {
  return <fbt desc="Notes filter summary: one item selected">1 selected</fbt>;
}

export function FilterSelectedCountSummary({ count }: { count: number }) {
  return (
    <fbt desc="Notes filter summary: multiple items selected">
      <fbt:param name="count">{count}</fbt:param> selected
    </fbt>
  );
}

export function filterModalFolderTitle() {
  return fbs("Folder", "Notes filter modal title: folder");
}

export function filterModalPeopleTitle() {
  return fbs("People", "Notes filter modal title: people");
}

export function filterModalFeelingTitle() {
  return fbs("Feeling", "Notes filter modal title: feeling");
}

export function filterModalLocationTitle() {
  return fbs("Location", "Notes filter modal title: location");
}

export function filterSearchFoldersPlaceholder() {
  return fbs("Search folders…", "Notes filter folder search placeholder");
}

export function filterSearchPeoplePlaceholder() {
  return fbs("Search people…", "Notes filter people search placeholder");
}

export function filterSearchLocationsPlaceholder() {
  return fbs("Search locations…", "Notes filter location search placeholder");
}

export function filterDefaultSearchPlaceholder() {
  return fbs("Search…", "Notes filter default search placeholder");
}

export function filterEmptyFoldersLabel() {
  return fbs("No folders with notes yet.", "Notes filter empty state: folders");
}

export function filterEmptyPeopleLabel() {
  return fbs("No people yet.", "Notes filter empty state: people");
}

export function filterEmptyFeelingsLabel() {
  return fbs("No feelings available.", "Notes filter empty state: feelings");
}

export function filterEmptyLocationsLabel() {
  return fbs("No locations yet.", "Notes filter empty state: locations");
}

export function filterDefaultEmptyLabel() {
  return fbs("Nothing to filter by yet.", "Notes filter default empty state");
}

export function renderFilterSelectedSummary(count: number): ReactNode {
  if (count === 0) {
    return <FilterSummaryAnyLabel />;
  }
  if (count === 1) {
    return <FilterOneSelectedSummary />;
  }
  return <FilterSelectedCountSummary count={count} />;
}
