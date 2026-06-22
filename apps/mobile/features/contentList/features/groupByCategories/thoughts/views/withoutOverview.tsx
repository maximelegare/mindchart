import { View } from "react-native";
import { CategorySection } from "../components/categorySection";
import { ThoughtWithoutOverview } from "../components/thoughtWithoutOverview";
import { useGroupByCategoriesThoughtsData } from "../hooks/useGroupByCategoriesThoughtsData";

export const ThoughtsListGroupByCategoriesWithoutOverviewFeature = () => {
  const parsedData = useGroupByCategoriesThoughtsData();

  if (!parsedData) return null;

  return (
    <View style={{ gap: 30, paddingTop: 20 }}>
      {parsedData.map((category) => (
        <CategorySection
          key={category.id}
          id={category.id}
          name={category.name}
          numberOfItems={category.thoughts.length}
        >
          {category.thoughts.map((thought) => (
            <ThoughtWithoutOverview key={thought.id} {...thought} />
          ))}
        </CategorySection>
      ))}
    </View>
  );
};
