import { CollapsibleContainer } from "@/components/ui/collapsibleContainer";
import { GroupingLabel } from "@/features/contentList/components/labels/groupingLabel";
import { ReactNode, useState } from "react";
import { View } from "react-native";

type TopicSectionProps = {
  id: string;
  name: string;
  children: ReactNode;
  numberOfItems?: number;
};

export const TopicSection = ({
  id,
  name,
  numberOfItems,
  children,
}: TopicSectionProps) => {
  const [expanded, setExpanded] = useState(true);
  return (
    <View className="gap-2">
      <GroupingLabel
        href={`/topics/${id}`}
        numberOfItems={numberOfItems}
        label={name}
        expanded={expanded}
        onPress={() => setExpanded(!expanded)}
      />
      <CollapsibleContainer expanded={expanded}>
        <View className="gap-2">{children}</View>
      </CollapsibleContainer>
    </View>
  );
};
