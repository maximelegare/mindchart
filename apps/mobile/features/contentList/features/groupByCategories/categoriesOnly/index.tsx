import { CategoriesListFeature } from "@/features/categories/features/categoriesList/views";
import { useContentListSort } from "@/features/contentList/hooks/useContentListSort";

export const CategoriesOnlyViewFeature = () => {
  const sortBy = useContentListSort();

  return <CategoriesListFeature withSpaceFiller={false} sortBy={sortBy} />;
};
