import { View } from "react-native";
import { PaginationControls } from "@/features/contentList/features/pagination/components/paginationControls";
import { CategorySection } from "../components/categorySection";
import { ExpandableThoughtWithOverview } from "../components/expandableThoughtWithOverview";
import {
  useGroupByCategoriesPagination,
  useGroupByCategoriesThoughtsData,
} from "../hooks/useGroupByCategoriesThoughtsData";
import { useCategoryLabelsMap } from "@/features/categories/hooks/useCategoryLabels";
import { stripHtml } from "@/components/ui/thoughtsEditor";
import { getThoughtPlainText } from "@repo/zod-schemas";

export const ThoughtsListGroupByCategoriesWithOverviewFeature = () => {
  const parsedData = useGroupByCategoriesThoughtsData();
  const categoryLabels = useCategoryLabelsMap();
  const { page, pageCount, setPage, isFetching } =
    useGroupByCategoriesPagination();

  if (!parsedData) return null;

  return (
    <View style={{ gap: 30, paddingTop: 20 }}>
      {parsedData.map((category) => (
        <CategorySection
          key={category.id}
          id={category.id}
          name={categoryLabels.get(category.id) ?? category.name}
          color={category.color}
          numberOfItems={category.thoughts.length}
        >
          {category.thoughts.map((thought) => (
            <ExpandableThoughtWithOverview
              key={thought.id}
              id={thought.id}
              noteId={thought.noteId ?? ""}
              title={
                stripHtml(thought.title) || stripHtml(thought.semanticLabel)
              }
              summary={stripHtml(getThoughtPlainText(thought))}
              date={thought.createdAt ?? ""}
              isChecklist={thought.type === "checkbox"}
              isCompleted={
                thought.type === "checkbox" ? thought.content.checked : false
              }
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
