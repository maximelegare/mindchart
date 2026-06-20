import { useControllers } from "@/api/controllers/useControllers";
import List from "@/components/ui/list";
import { SpaceFiller } from "@/components/ui/spaceFiller";
import { useMemo } from "react";
import z from "zod";
import { CategoryItem } from "../components/categoriesList";
import { CategoryWithThoughtsInfosSchema } from "@repo/zod-schemas/src/schemas";
import {
  SortBy,
  sortContentList,
} from "@/features/contentList/utils/sortContentList";

export const CategoriesListFeature = ({
  withSpaceFiller = true,
  sortBy,
}: {
  withSpaceFiller?: boolean;
  sortBy?: SortBy;
}) => {
  const { useFetchAllCategoriesWithThoughtsInfosQuery } =
    useControllers().categories;

  const { data } = useFetchAllCategoriesWithThoughtsInfosQuery();

  const parsedData = useMemo(() => {
    if (!data || !Array.isArray(data)) return null;
    const result = z.array(CategoryWithThoughtsInfosSchema).safeParse(data);
    if (!result.success) return null;

    const categoriesWithContent = result.data.filter(
      (category) => category.thoughtCount > 0
    );

    if (!sortBy) return categoriesWithContent;

    return sortContentList(categoriesWithContent, sortBy, {
      getName: (category) => category.name,
      getDate: (category) => category.createdAt,
    });
  }, [data, sortBy]);

  if (!parsedData) return null;

  return (
    <List className="gap-2 border-[0px]" style={{ paddingTop: 20 }}>
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
