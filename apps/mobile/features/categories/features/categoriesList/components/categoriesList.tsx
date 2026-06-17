import { memo } from "react";
import { Pressable, View } from "react-native";
import { Typography } from "@/components/ui/typography";
// import { DisplayDate } from "@/components/ui/date";
import { Category } from "@repo/zod-schemas/src/schemas";
// import { CategoryBottomSheet } from "../../categoryBottomSheet";
import { CATEGORIES_COLORS } from "@repo/theme/categories";
import { CategoryKey } from "@repo/sqlite";
// import { Button } from "@/components/ui";
// import { useRouter } from "expo-router";
// import { Icon } from "@/components/ui/icons/icon";

export const CategoryItem: React.FC<Category> = memo((category) => {
  const { name, id } = category;
  // const { push } = useRouter();
  return (
    <>
      <View className="bg-card border-border border w-full rounded-lg p-2">
        <Pressable>
          <View>
            {/* <Separator className="mb-2" color="border" /> */}
            <View className="py-2 flex-row gap-2 justify-between items-center">
              <View>
                <View
                  className="w-4 h-4 rounded-full"
                  style={{
                    backgroundColor: CATEGORIES_COLORS[id as CategoryKey],
                  }}
                ></View>
              </View>
              <View className="flex-1">
                <Typography variant="h3">{name.toUpperCase()}</Typography>
              </View>
              {/* 
              <Button
                variant="ghost"
                onPress={() =>
                  push({
                    pathname: "/graph/[id]",
                    params: {
                      id: id,
                      _t: Date.now(), // This ensures the 'params' object is always a new reference
                    },
                  })
                }
              >
                <Icon color="text" name="graph" />
              </Button> */}
            </View>
          </View>
        </Pressable>
      </View>
    </>
  );
});
