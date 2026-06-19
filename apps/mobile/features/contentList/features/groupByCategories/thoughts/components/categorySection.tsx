import { GroupingLabel } from "@/features/contentList/components/labels/groupingLabel";
import { CategoryKey } from "@repo/sqlite";
import { CATEGORIES_COLORS } from "@repo/theme/categories";
import { ReactNode } from "react";
import { View } from "react-native";

type CategorySectionProps = {
  id: string;
  name: string;
  children: ReactNode;
};

export const CategorySection = ({
  id,
  name,
  children,
}: CategorySectionProps) => (
  <View className="gap-2">
    <GroupingLabel
      label={name}
      colorBadge={CATEGORIES_COLORS[id as CategoryKey]}
    />
    {children}
  </View>
);
