import { GroupingLabel } from "@/features/contentList/components/labels/groupingLabel";
import { ReactNode } from "react";
import { View } from "react-native";

type TopicSectionProps = {
  name: string;
  children: ReactNode;
};

export const TopicSection = ({ name, children }: TopicSectionProps) => (
  <View className="gap-2">
    <GroupingLabel label={name} />
    {children}
  </View>
);
