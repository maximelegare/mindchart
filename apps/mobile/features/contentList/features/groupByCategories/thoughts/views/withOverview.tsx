import { View } from "react-native";
import { Separator } from "@/components/ui/separator";
import { Typography } from "@/components/ui/typography";
import { useState } from "react";
import { CategorySection } from "../components/categorySection";
import { ExpandableThoughtWithOverview } from "../components/expandableThoughtWithOverview";
import { useGroupByCategoriesThoughtsData } from "../hooks/useGroupByCategoriesThoughtsData";

export const ThoughtsListGroupByCategoriesWithOverviewFeature = () => {
  const parsedData = useGroupByCategoriesThoughtsData();
  const [expandedCardId, setExpandedCardId] = useState<string | null>();

  const handleExpandableCardPress = (id: string) => {
    if (expandedCardId === id) setExpandedCardId(null);
    else setExpandedCardId(id);
  };

  if (!parsedData) return null;

  return (
    <View style={{ gap: 30, paddingTop: 20 }}>
      {parsedData.map((category) => (
        <CategorySection
          key={category.id}
          id={category.id}
          name={category.name}
        >
          {category.thoughts.map((thought) => (
            <ExpandableThoughtWithOverview
              key={thought.id}
              id={thought.id}
              noteId={thought.noteId}
              title={thought.title}
              date={thought.createdAt}
              expanded={expandedCardId === thought.id}
              onPress={handleExpandableCardPress}
            >
              <View className="gap-3 mt-2">
                <Separator />
                <Typography variant="p">{thought.summary}</Typography>
              </View>
            </ExpandableThoughtWithOverview>
          ))}
        </CategorySection>
      ))}
    </View>
  );
};
