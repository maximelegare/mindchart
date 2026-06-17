import { useControllers } from "@/api/controllers/useControllers";
import List from "@/components/ui/list";
import { SpaceFiller } from "@/components/ui/spaceFiller";
import { useMemo } from "react";
import { CategorySchema } from "@repo/zod-schemas";
import z from "zod";
import { CategoryItem } from "../components/categoriesList";

export const CategoriesListFeature = ({
  withSpaceFiller = true,
}: {
  withSpaceFiller?: boolean;
}) => {
  const { useFetchAllCategoriesQuery } = useControllers().categories;

  const { data } = useFetchAllCategoriesQuery();

  const parsedData = useMemo(() => {
    if (!data || !Array.isArray(data)) return null;
    const result = z.array(CategorySchema).safeParse(data);
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
