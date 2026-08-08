import type { FeelingValue } from "@repo/zod-schemas/src/schemas";

export type DisplayMode = "notes" | "categories";

export type DisplayKey = "notes" | "notes-overview" | "categories";

export type FoldersMode = "with" | "without";

export type OptionsBar = {
  sortBy: "newest" | "oldest" | "az" | "za";
  groupBy: "folders" | "categories" | "none";
  displayMode: DisplayMode;
  /** Browse via folders + breadcrumbs, or via folder/category filter chips */
  foldersMode: FoldersMode;
  /** `null` = All folders */
  selectedFolderId: string | null;
  /** `null` = All categories */
  selectedCategoryId: string | null;
  /** `null` = root (no folder selected) */
  currentFolderId: string | null;
  /** Right folder-tree sidebar visibility on the notes list */
  folderTreeSidebarOpen: boolean;
  /** Empty = no people filter */
  filterPersonIds: string[];
  /** Empty = no feeling filter */
  filterFeelings: FeelingValue[];
  /** Empty = no location filter */
  filterLocationIds: string[];
};

export type UiKey = `groupBy=${OptionsBar["groupBy"]}&display=${DisplayKey}`;
