import { useControllers } from "@/api/controllers/useControllers";
import List from "@/components/ui/list";
import { SpaceFiller } from "@/components/ui/spaceFiller";
import { useMemo } from "react";
import { CategorySchema } from "@repo/zod-schemas";
import z from "zod";
import { CategoryItem } from "../components/categoriesList";
import { CategoryWithThoughtsInfosSchema } from "@repo/zod-schemas/src/schemas";

export const CategoriesListFeature = ({
  withSpaceFiller = true,
}: {
  withSpaceFiller?: boolean;
}) => {
  const { useFetchAllCategoriesWithThoughtsInfosQuery } =
    useControllers().categories;

  const { data } = useFetchAllCategoriesWithThoughtsInfosQuery();

  const parsedData = useMemo(() => {
    if (!data || !Array.isArray(data)) return null;
    const result = z.array(CategoryWithThoughtsInfosSchema).safeParse(data);
    return result.success ? result.data : null;
  }, [data]);

  if (!parsedData) return null;

  return (
    <List className="gap-2 border-[0px]">
      {data?.map((category) => (
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
