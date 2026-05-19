import { Card } from "@/components/ui/card";
import { Icon } from "@/components/ui/icons/icon";
import { Typography } from "@/components/ui/typography";
import { NodeDatum } from "@/features/graph/types/types";
import { useRouter } from "expo-router";
import React from "react";
import { Pressable, View } from "react-native";
import { hsl } from "@/utils/hsl";
import { useColorScheme } from "@/lib/useColorScheme";
import { CategoryKey } from "@repo/sqlite";
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
  const { summary, categoryId, name, children, noteId } = thought;

  const { colorScheme } = useColorScheme();
  const { setParams, push } = useRouter();

  const handleZoom = () => {
    // Make sure this matches whatever field is used in CirclePackSkia for dbId
    const targetId = thought.id;
    setParams({
      id: targetId,
      _t: Date.now().toString(),
    });
  };

  const categoryColor = hsl(
    (categoryId?.toLowerCase() as CategoryKey) ??
      (name?.toLowerCase() as CategoryKey),
    colorScheme,
    parentNodeId === "root" ? 0 : 50,
    "categories"
  );

  const navigateToNote = () => {
    if (!noteId) return;
    push({
      pathname: "/notes/[id]",
      params: { id: noteId },
    });
  };

  return (
    <Pressable onPress={children && handleZoom} id={thought.thoughtId}>
      <Card
        className={cn(
          "h-fit flex-row gap-2 w-full items-center overflow-hidden bg-muted",
          isHighlighted && "border-2"
        )}
        style={{
          borderColor: hsl("border", colorScheme, isHighlighted ? 30 : 10),
        }}
      >
        <View
          style={{ backgroundColor: categoryColor }}
          className="w-3 h-full"
        ></View>
        <View className="flex-row justify-between gap-2 p-1 pr-4">
          <View className={cn("flex-1", !summary && "flex-row")}>
            <View className="flex-row items-center gap-2">
              <Typography variant="h3">{capitalize(name)}</Typography>
              {children && (
                <Typography variant="p">({children?.length})</Typography>
              )}
            </View>
            {summary && <Typography variant="p">{summary}</Typography>}
          </View>
          <View>
            {children && (
              <View className="p-2">
                <Icon color="text" name="graph" />
              </View>
            )}
            {noteId && (
              <Button className="p-2" variant="ghost" onPress={navigateToNote}>
                <Icon color="text" name="notebook-text" />
              </Button>
            )}
          </View>
        </View>
      </Card>
    </Pressable>
  );
};
