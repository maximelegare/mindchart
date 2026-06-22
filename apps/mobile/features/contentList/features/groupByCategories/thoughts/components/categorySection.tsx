import { CollapsibleContainer } from "@/components/ui/collapsibleContainer";
import { GroupingLabel } from "@/features/contentList/components/labels/groupingLabel";
import { CategoryKey } from "@repo/sqlite";
import { CATEGORIES_COLORS } from "@repo/theme/categories";
import { ReactNode, useState } from "react";
import { View } from "react-native";

type CategorySectionProps = {
  id: string;
  name: string;
  children: ReactNode;
  numberOfItems?: number;
};

export const CategorySection = ({
  id,
  name,
  children,
  numberOfItems,
}: CategorySectionProps) => {
  const [expanded, setExpanded] = useState(true);

  return (
    <View className="gap-2">
      <GroupingLabel
        label={name}
        colorBadge={CATEGORIES_COLORS[id as CategoryKey]}
        expanded={expanded}
        onPress={() => setExpanded(!expanded)}
        numberOfItems={numberOfItems}
      />
      <CollapsibleContainer expanded={expanded}>
        <View className="gap-2">{children}</View>
      </CollapsibleContainer>
    </View>
  );
};
