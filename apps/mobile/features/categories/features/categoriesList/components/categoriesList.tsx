import { memo } from "react";
import { View } from "react-native";
import { Typography } from "@/components/ui/typography";
import { CategoryWithThoughtsInfos } from "@repo/zod-schemas/src/schemas";
import { CATEGORIES_COLORS } from "@repo/theme/categories";
import { CategoryKey } from "@repo/sqlite";
import { Button } from "@/components/ui";
import { useRouter } from "expo-router";
import { Icon } from "@/components/ui/icons/icon";

export const CategoryItem: React.FC<CategoryWithThoughtsInfos> = memo(
  (category) => {
    const { name, id, thoughtCount } = category;
    const { push } = useRouter();

    return (
      <View className="bg-card border-border border w-full rounded-lg p-2">
        <View>
          <View className="py-2 flex-row gap-2 justify-between items-center">
            <View
              className="w-4 h-4 rounded-full"
              style={{
                backgroundColor: CATEGORIES_COLORS[id as CategoryKey],
              }}
            />
            <View className="flex-1">
              <Typography variant="h3">{name.toUpperCase()}</Typography>
            </View>
            <Button
              variant="ghost"
              size="xs"
              onPress={() =>
                push({
                  pathname: "/graph/[id]",
                  params: {
                    id: `category-${id}`,
                    _t: Date.now(),
                  },
                })
              }
            >
              <Icon color="text" name="graph" />
            </Button>
          </View>
          <View className="flex-row items-center justify-between">
            <Typography variant="muted">
              Associated thoughts: {thoughtCount}
            </Typography>
          </View>
        </View>
      </View>
    );
  }
);
