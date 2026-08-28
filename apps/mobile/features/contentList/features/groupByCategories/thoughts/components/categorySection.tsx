import { CollapsibleContainer } from "@/components/ui/collapsibleContainer";
import { GroupingLabel } from "@/features/contentList/components/labels/groupingLabel";
import { ReactNode, useState } from "react";
import { View } from "react-native";

type CategorySectionProps = {
  id: string;
  name: string;
  color: string;
  children: ReactNode;
  numberOfItems?: number;
};

export const CategorySection = ({
  name,
  color,
  children,
  numberOfItems,
}: CategorySectionProps) => {
  const [expanded, setExpanded] = useState(true);

  return (
    <View className="gap-2">
      <GroupingLabel
        label={name}
        colorBadge={color}
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
