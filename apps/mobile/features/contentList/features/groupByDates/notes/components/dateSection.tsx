import { CollapsibleContainer } from "@/components/ui/collapsibleContainer";
import { GroupingLabel } from "@/features/contentList/components/labels/groupingLabel";
import { ReactNode, useState } from "react";
import { View } from "react-native";
import { DateGroupLabel } from "./dateGroupLabel";

type DateSectionProps = {
  dateKey: string;
  children: ReactNode;
  numberOfItems?: number;
};

export const DateSection = ({
  dateKey,
  numberOfItems,
  children,
}: DateSectionProps) => {
  const [expanded, setExpanded] = useState(true);
  return (
    <View className="gap-2">
      <GroupingLabel
        numberOfItems={numberOfItems}
        label={<DateGroupLabel dateKey={dateKey} />}
        expanded={expanded}
        onPress={() => setExpanded(!expanded)}
      />
      <CollapsibleContainer expanded={expanded}>
        <View className="gap-2">{children}</View>
      </CollapsibleContainer>
    </View>
  );
};
