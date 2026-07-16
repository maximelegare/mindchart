import { CategoriesListFeature } from "@/features/categories/features/categoriesList/views";
import { useSelectedCategoryId } from "@/features/contentList/hooks/useContentListFilter";
import { useContentListSort } from "@/features/contentList/hooks/useContentListSort";

export const CategoriesOnlyViewFeature = () => {
  const sortBy = useContentListSort();
  const selectedCategoryId = useSelectedCategoryId();

  return (
    <CategoriesListFeature
      withSpaceFiller={false}
      sortBy={sortBy}
      selectedCategoryId={selectedCategoryId}
    />
  );
};
