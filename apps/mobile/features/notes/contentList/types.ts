export type OptionsBar = {
  sortBy: "newest" | "oldest" | "az" | "za";
  groupBy: "topics" | "categories" | "none";
  display: ("notes" | "topics" | "categories" | "overview")[];
};

type SortedDisplayItems = ["categories", "notes", "overview", "topics"];

type JoinDisplay<T extends readonly string[]> = T extends readonly [
  infer F extends string,
  ...infer R extends readonly string[],
]
  ? R extends readonly []
    ? F
    : `${F}-${JoinDisplay<R>}`
  : "";

type DisplaySubset<
  All extends readonly string[],
  Selected extends readonly string[] = [],
> = All extends readonly [
  infer Head extends string,
  ...infer Tail extends readonly string[],
]
  ? DisplaySubset<Tail, Selected> | DisplaySubset<Tail, [...Selected, Head]>
  : Selected extends readonly []
    ? never
    : JoinDisplay<Selected>;

export type DisplayKey = DisplaySubset<SortedDisplayItems>;

export type UiKey = `groupBy=${OptionsBar["groupBy"]}&display=${DisplayKey}`;
