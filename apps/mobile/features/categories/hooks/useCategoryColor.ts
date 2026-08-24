import { useMemo } from "react";
import { Category } from "@repo/zod-schemas";
import { useCategoriesController } from "@/api/controllers/useCategoriesController";

export const DEFAULT_CATEGORY_COLOR = "hsl(0, 0%, 84.3%)";

export function getCategoryColor(
  categories: Category[] | undefined,
  categoryId: string | undefined
): string {
  if (!categories || !categoryId) return DEFAULT_CATEGORY_COLOR;
  return (
    categories.find((category) => category.id === categoryId)?.color ??
    DEFAULT_CATEGORY_COLOR
  );
}

export function useCategoryColorMap(): Map<string, string> {
  const { useFetchAllCategoriesQuery } = useCategoriesController();
  const { data: categories } = useFetchAllCategoriesQuery();

  return useMemo(() => {
    const map = new Map<string, string>();
    if (!categories) return map;
    for (const category of categories) {
      map.set(category.id, category.color);
    }
    return map;
  }, [categories]);
}

export function useCategoryColor(categoryId: string | undefined): string {
  const map = useCategoryColorMap();
  return map.get(categoryId ?? "") ?? DEFAULT_CATEGORY_COLOR;
}
