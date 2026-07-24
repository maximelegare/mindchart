export type DisplayMode = "notes" | "topics" | "categories";

export type DisplayKey = "notes" | "notes-overview" | "topics" | "categories";

export type FoldersMode = "with" | "without";

export type OptionsBar = {
  sortBy: "newest" | "oldest" | "az" | "za";
  groupBy: "topics" | "categories" | "none";
  displayMode: DisplayMode;
  /** Browse via folders + breadcrumbs, or via topic/category filter chips */
  foldersMode: FoldersMode;
  /** `null` = All topics */
  selectedTopicId: string | null;
  /** `null` = All categories */
  selectedCategoryId: string | null;
  /** `null` = root (no folder selected) */
  currentFolderId: string | null;
};

export type UiKey = `groupBy=${OptionsBar["groupBy"]}&display=${DisplayKey}`;
