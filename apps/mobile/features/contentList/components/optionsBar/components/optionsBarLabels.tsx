import type { ReactNode } from "react";
import type { DisplayMode, FoldersMode, OptionsBar } from "../../../types";

type SortBy = OptionsBar["sortBy"];
type GroupBy = OptionsBar["groupBy"];

export function SortSheetTitle() {
  return <fbt desc="Options bar sort sheet title">Sort by</fbt>;
}

export function GroupSheetTitle() {
  return <fbt desc="Options bar group sheet title">Group by</fbt>;
}

export function SortOptionLabel({ value }: { value: SortBy }) {
  switch (value) {
    case "newest":
      return <fbt desc="Sort option: newest first">Newest first</fbt>;
    case "oldest":
      return <fbt desc="Sort option: oldest first">Oldest first</fbt>;
    case "az":
      return <fbt desc="Sort option: alphabetical A to Z">Alphabetical</fbt>;
    case "za":
      return <fbt desc="Sort option: alphabetical Z to A">Z to A order</fbt>;
  }
}

export function GroupOptionLabel({ value }: { value: GroupBy }) {
  switch (value) {
    case "folders":
      return <fbt desc="Group option: by folder">By folder</fbt>;
    case "categories":
      return <fbt desc="Group option: by category">By category</fbt>;
    case "none":
      return <fbt desc="Group option: no grouping">Not grouping</fbt>;
  }
}

export function GroupChipLabel({
  value,
  showPrefix,
}: {
  value: GroupBy;
  showPrefix: boolean;
}) {
  if (showPrefix) {
    return (
      <fbt desc="Group filter chip with selected grouping option">
        Group{" "}
        <fbt:param name="option">
          <GroupOptionLabel value={value} />
        </fbt:param>
      </fbt>
    );
  }

  return <GroupOptionLabel value={value} />;
}

export function FoldersModeChipLabel({ mode }: { mode: FoldersMode }) {
  if (mode === "with") {
    return <fbt desc="Folders mode: with folders">With folders</fbt>;
  }

  return <fbt desc="Folders mode: without folders">Without folders</fbt>;
}

export function DisplayModeChipLabel({ mode }: { mode: DisplayMode }) {
  if (mode === "notes") {
    return <fbt desc="Display mode: notes">Display Notes</fbt>;
  }

  return <fbt desc="Display mode: categories">Display Categories</fbt>;
}

export type OptionLabelRenderer<T extends string> = (value: T) => ReactNode;

export function renderSortChipLabel(value: SortBy) {
  return <SortOptionLabel value={value} />;
}

export function renderGroupChipLabel(
  value: GroupBy,
  showGroupPrefix?: boolean
) {
  return <GroupChipLabel value={value} showPrefix={!!showGroupPrefix} />;
}
