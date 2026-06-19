import { Typography } from "@/components/ui/typography";
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
    <View
      className="flex-row items-center gap-2 rounded-full bg-border px-2 py-0.5"
      style={{ alignSelf: "flex-start", flexGrow: 0 }}
    >
      <View
        className="h-3 w-3 rounded-full"
        style={{ backgroundColor: CATEGORIES_COLORS[id as CategoryKey] }}
      />
      <Typography variant="muted">{name.toUpperCase()}</Typography>
    </View>
    {children}
  </View>
);
