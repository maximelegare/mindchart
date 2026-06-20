import { memo } from "react";
import { View } from "react-native";
import { Typography } from "@/components/ui/typography";
import { DisplayDate } from "@/components/ui/date";
import { CategoryWithThoughtsInfos } from "@repo/zod-schemas/src/schemas";
import { CATEGORIES_COLORS } from "@repo/theme/categories";
import { CategoryKey } from "@repo/sqlite";
import { Separator } from "@/components/ui/separator";
import { CardTitleRow } from "@/features/contentList/components/cards/shared/cardTitleRow";
import { CategoryBottomSheet } from "../../categoryBottomSheet";
import { GraphButton } from "@/components/ui/buttons/graphButton";

export const CategoryItem: React.FC<CategoryWithThoughtsInfos> = memo(
  (category) => {
    const { name, id, thoughtCount, createdAt } = category;

    return (
      <View className="bg-card border-border border w-full rounded-lg p-2 pb-3">
        <View className="flex-row items-center justify-between mb-1">
          <DisplayDate date={createdAt} />
        </View>
        <Separator className="mb-2" color="border" />
        <View className="flex-row gap-2 items-start">
          <View
            className="w-4 h-4 rounded-full mt-1"
            style={{
              backgroundColor: CATEGORIES_COLORS[id as CategoryKey],
            }}
          />
          <View className="flex-1">
            <CardTitleRow
              title={name}
              trailingActions={<GraphButton id={id} elementType="category" />}
              menu={<CategoryBottomSheet category={category} />}
            />
          </View>
        </View>
        <View
          className="flex-row items-center justify-between"
          style={{ marginTop: 12 }}
        >
          <Typography variant="muted">
            Associated thoughts: {thoughtCount}
          </Typography>
        </View>
      </View>
    );
  }
);
