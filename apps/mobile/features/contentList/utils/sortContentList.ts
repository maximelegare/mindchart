import type { SortDirection, SortField } from "../types";

export type SortOptions = {
  field: SortField;
  direction: SortDirection;
};

type SortKeys<T> = {
  getName: (item: T) => string;
  getCreatedAt?: (item: T) => string | null | undefined;
  getUpdatedAt?: (item: T) => string | null | undefined;
  getLastViewedAt?: (item: T) => string | null | undefined;
};

const compareNames = (a: string, b: string) =>
  a.localeCompare(b, undefined, { sensitivity: "base" });

const compareDates = (a: string, b: string) => a.localeCompare(b);

const valueForField = <T>(item: T, field: SortField, keys: SortKeys<T>) => {
  if (field === "alphabetical") return keys.getName(item);
  if (field === "lastViewed") return keys.getLastViewedAt?.(item) ?? "";
  if (field === "updatedAt") return keys.getUpdatedAt?.(item) ?? "";
  return keys.getCreatedAt?.(item) ?? "";
};

export const sortContentList = <T>(
  items: T[],
  sort: SortOptions,
  keys: SortKeys<T>
): T[] => {
  return [...items].sort((a, b) => {
    const valueA = valueForField(a, sort.field, keys);
    const valueB = valueForField(b, sort.field, keys);
    const compared =
      sort.field === "alphabetical"
        ? compareNames(valueA, valueB)
        : compareDates(valueA, valueB);

    const fromBeginning = sort.direction === "asc";
    if (sort.field === "alphabetical") {
      return fromBeginning ? compared : -compared;
    }

    return fromBeginning ? -compared : compared;
  });
};

export const latestDate = (
  dates: Array<string | null | undefined>
): string | undefined => {
  const valid = dates.filter((date): date is string => Boolean(date));
  if (!valid.length) return undefined;
  return [...valid].sort((a, b) => compareDates(b, a))[0];
};
