import { Button } from "@/components/ui";
import { Card } from "@/components/ui/card";
import { Icon } from "@/components/ui/icons/icon";
import { Typography } from "@/components/ui/typography";
import { Thought } from "@repo/zod-schemas";
import { useRouter } from "expo-router";
import React from "react";
import { View } from "react-native";
import { CATEGORIES_COLORS } from "@repo/theme/categories";
import { CategoryKey } from "@repo/sqlite";
import capitalize from "@/utils/stringManipulations/capitalize";

type ThoughtItem = {
  thoughts: Thought & { idx: number };
};

export const ThoughtItem: React.FC<ThoughtItem> = ({ thoughts }) => {
  const { title, summary, thoughtId, categoryId } = thoughts;

  const { push } = useRouter();

  return (
    <Card className="bg-muted border-none p-1">
      <View className="flex-row justify-between gap-2">
        <View className="flex-1">
          <View className="flex-row items-center gap-2 pb-2">
            <View
              className="w-4 h-4 rounded-full"
              style={{
                backgroundColor: CATEGORIES_COLORS[categoryId as CategoryKey],
              }}
            ></View>
            <Typography variant="p" className="opacity-40">
              {capitalize(categoryId)}
            </Typography>
          </View>
          <Typography variant="h3">{title}</Typography>
          <Typography variant="p">{summary}</Typography>
        </View>
        <View>
          <Button
            variant="ghost"
            onPress={() =>
              push({
                pathname: "/graph/[id]",
                params: {
                  id: thoughtId,
                  _t: Date.now(), // This ensures the 'params' object is always a new reference
                },
              })
            }
          >
            <Icon color="text" name="graph" />
          </Button>
          <Button variant="ghost">
            <Icon name="notebook-text" color="text" />
          </Button>
        </View>
      </View>
    </Card>
  );
};
