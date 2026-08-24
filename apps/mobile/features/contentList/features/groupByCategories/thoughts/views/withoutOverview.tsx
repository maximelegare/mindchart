import { View } from "react-native";
import { PaginationControls } from "@/features/contentList/features/pagination/components/paginationControls";
import { CategorySection } from "../components/categorySection";
import { ThoughtWithoutOverview } from "../components/thoughtWithoutOverview";
import {
  useGroupByCategoriesPagination,
  useGroupByCategoriesThoughtsData,
} from "../hooks/useGroupByCategoriesThoughtsData";

export const ThoughtsListGroupByCategoriesWithoutOverviewFeature = () => {
  const parsedData = useGroupByCategoriesThoughtsData();
  const { page, pageCount, setPage, isFetching } =
    useGroupByCategoriesPagination();

  if (!parsedData) return null;

  return (
    <View style={{ gap: 30, paddingTop: 20 }}>
      {parsedData.map((category) => (
        <CategorySection
          key={category.id}
          id={category.id}
          name={category.name}
          color={category.color}
          numberOfItems={category.thoughts.length}
        >
          {category.thoughts.map((thought) => (
            <ThoughtWithoutOverview
              key={thought.id}
              {...thought}
              createdAt={thought.createdAt ?? null}
              noteId={thought.noteId ?? ""}
            />
          ))}
        </CategorySection>
      ))}
      <PaginationControls
        page={page}
        pageCount={pageCount}
        onPageChange={setPage}
        isFetching={isFetching}
      />
    </View>
  );
};
