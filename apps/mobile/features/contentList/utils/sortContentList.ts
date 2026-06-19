import { OptionsBar } from "../types";

export type SortBy = OptionsBar["sortBy"];

type SortKeys<T> = {
  getName: (item: T) => string;
  getDate?: (item: T) => string | null | undefined;
};

const compareNames = (a: string, b: string) =>
  a.localeCompare(b, undefined, { sensitivity: "base" });

const compareDates = (a: string, b: string) => b.localeCompare(a);

export const sortContentList = <T>(
  items: T[],
  sortBy: SortBy,
  keys: SortKeys<T>
): T[] => {
  const getDate = keys.getDate ?? (() => undefined);

  return [...items].sort((a, b) => {
    const nameA = keys.getName(a);
    const nameB = keys.getName(b);

    if (sortBy === "az") return compareNames(nameA, nameB);
    if (sortBy === "za") return compareNames(nameB, nameA);

    const dateA = getDate(a) ?? "";
    const dateB = getDate(b) ?? "";

    return sortBy === "newest"
      ? compareDates(dateA, dateB)
      : compareDates(dateB, dateA);
  });
};

export const latestDate = (
  dates: Array<string | null | undefined>
): string | undefined => {
  const valid = dates.filter((date): date is string => Boolean(date));
  if (!valid.length) return undefined;
  return valid.sort(compareDates)[0];
};
