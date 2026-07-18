export type DisplayMode = "notes" | "topics" | "categories";

export type DisplayKey = "notes" | "notes-overview" | "topics" | "categories";

export type OptionsBar = {
  sortBy: "newest" | "oldest" | "az" | "za";
  groupBy: "topics" | "categories" | "none";
  displayMode: DisplayMode;
  /** `null` = All topics */
  selectedTopicId: string | null;
  /** `null` = All categories */
  selectedCategoryId: string | null;
};

export type UiKey = `groupBy=${OptionsBar["groupBy"]}&display=${DisplayKey}`;
