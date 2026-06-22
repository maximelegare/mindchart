export type DisplayMode = "notes" | "topics" | "categories";

export type DisplayKey = "notes" | "notes-overview" | "topics" | "categories";

export type OptionsBar = {
  sortBy: "newest" | "oldest" | "az" | "za";
  groupBy: "topics" | "categories" | "none";
  displayMode: DisplayMode;
  showOverview: boolean;
};

export type UiKey = `groupBy=${OptionsBar["groupBy"]}&display=${DisplayKey}`;
