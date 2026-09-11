import { useControllers } from "@/api/controllers/useControllers";
import List from "@/components/ui/list";
import { SpaceFiller } from "@/components/ui/spaceFiller";
import { useCategoryLabelsMap } from "@/features/categories/hooks/useCategoryLabels";
import { useMemo } from "react";
import z from "zod";
import { CategoryItem } from "../components/categoriesList";
import { CategoryWithThoughtsInfosSchema } from "@repo/zod-schemas";
import {
  SortOptions,
  sortContentList,
} from "@/features/contentList/utils/sortContentList";

export const CategoriesListFeature = ({
  withSpaceFiller = true,
  sortBy,
  selectedCategoryId,
}: {
  withSpaceFiller?: boolean;
  sortBy?: SortOptions;
  selectedCategoryId?: string | null;
}) => {
  const { useFetchAllCategoriesWithThoughtsInfosQuery } =
    useControllers().categories;
  const categoryLabels = useCategoryLabelsMap();

  const { data } = useFetchAllCategoriesWithThoughtsInfosQuery();

  const parsedData = useMemo(() => {
    if (!data || !Array.isArray(data)) return null;
    const result = z.array(CategoryWithThoughtsInfosSchema).safeParse(data);
    if (!result.success) return null;

    const categoriesWithContent = result.data
      .map((category) => ({
        ...category,
        name: categoryLabels.get(category.id) ?? category.name,
      }))
      .filter(
        (category) =>
          category.thoughtCount > 0 &&
          (selectedCategoryId == null || category.id === selectedCategoryId)
      );

    if (!sortBy) return categoriesWithContent;

    return sortContentList(categoriesWithContent, sortBy, {
      getName: (category) => category.name,
      getCreatedAt: (category) => category.createdAt,
    });
  }, [categoryLabels, data, selectedCategoryId, sortBy]);

  if (!parsedData) return null;

  return (
    <List variant="plain" className="gap-2" style={{ paddingTop: 20 }}>
      {parsedData.map((category) => (
        <CategoryItem key={category.id} {...category} />
      ))}
      {withSpaceFiller ? (
        <SpaceFiller
          sizes={{ marginBottom: ["TAB_BAR_HEIGHT", "HEADER_OVERLAP"] }}
        />
      ) : null}
    </List>
  );
};
