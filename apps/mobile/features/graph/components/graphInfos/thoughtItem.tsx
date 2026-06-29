import { Card } from "@/components/ui/card";
import { Icon } from "@/components/ui/icons/icon";
import { Typography } from "@/components/ui/typography";
import { NodeDatum } from "@/features/graph/types/types";
import { useRouter } from "expo-router";
import React from "react";
import { Pressable, View } from "react-native";
import { hsl } from "@/utils/hsl";
import { useColorScheme } from "@/lib/useColorScheme";
import {
  resolveListItemCategoryShade,
  resolveNodeCategoryKey,
} from "../../utils/resolveNodeCategoryKey";
import { cn } from "@/lib/cn";
import { Button } from "@/components/ui";
import capitalize from "@/utils/stringManipulations/capitalize";

type ThoughtItem = {
  thought: NodeDatum & { idx: number };
  parentNodeId: string;
  isHighlighted: boolean;
};

export const ThoughtItem: React.FC<ThoughtItem> = ({
  thought,
  parentNodeId,
  isHighlighted,
}) => {
  const { summary, name, children, noteId } = thought;

  const { colorScheme } = useColorScheme();
  const { setParams, push } = useRouter();

  const handleZoom = () => {
    const targetId = thought.id;
    setParams({
      id: targetId,
      _t: Date.now().toString(),
    });
  };

  const categoryKey = resolveNodeCategoryKey(thought);
  const categoryColor = categoryKey
    ? hsl(
        categoryKey,
        colorScheme,
        resolveListItemCategoryShade(parentNodeId),
        "categories"
      )
    : hsl("border", colorScheme);

  const navigateToNote = () => {
    if (!noteId) return;
    push({
      pathname: "/notes/[id]",
      params: { id: noteId },
    });
  };

  return (
    <Pressable
      onPress={children ? handleZoom : undefined}
      id={thought.thoughtId}
    >
      <Card
        className={cn(
          "w-full flex-row overflow-hidden bg-muted",
          isHighlighted && "border-2"
        )}
        style={{
          borderColor: hsl("border", colorScheme, isHighlighted ? 30 : 10),
        }}
      >
        <View
          style={{ backgroundColor: categoryColor }}
          className="w-3 self-stretch"
        />
        <View
          className={cn(
            "flex-1 min-w-0 flex-row gap-2 p-2",
            noteId ? "items-start" : "items-center"
          )}
        >
          <View className="flex-1 min-w-0">
            <View className="flex-row items-center gap-2">
              <Typography variant="h3" numberOfLines={1}>
                {capitalize(name || "")}
              </Typography>
              {children ? (
                <Typography variant="p">({children.length})</Typography>
              ) : null}
            </View>
            {summary ? (
              <Typography variant="p" numberOfLines={2}>
                {summary}
              </Typography>
            ) : null}
          </View>
          <View
            className={cn(
              "flex-row shrink-0",
              noteId ? "items-start" : "items-center"
            )}
          >
            {children ? (
              <View className="h-9 w-9 items-center justify-center">
                <Icon
                  size={20}
                  color="text"
                  name="graph"
                  style={{ opacity: 0.8 }}
                />
              </View>
            ) : null}
            {noteId ? (
              <Button
                className="h-9 w-9 p-0"
                variant="ghost"
                size="icon"
                onPress={navigateToNote}
              >
                <Icon
                  size={20}
                  color="text"
                  name="notebook-text"
                  style={{ opacity: 0.8 }}
                />
              </Button>
            ) : null}
          </View>
        </View>
      </Card>
    </Pressable>
  );
};
