import React from "react";
import { Pressable, View } from "react-native";
import { useRouter } from "expo-router";
import { Typography } from "@/components/ui/typography";
import { Icon } from "@/components/ui/icons/icon";
import { useColorScheme } from "@/lib/useColorScheme";
import { hsl } from "@/utils/hsl";
import capitalize from "@/utils/stringManipulations/capitalize";
import { onGraphBreadcrumbNavigate } from "@/features/navigation/syncLinkedBreadcrumbs";
import { useGraphStore } from "../../context/graphContext";
import { resolveNodeCategoryKey } from "../../utils/resolveNodeCategoryKey";
import type { NodeDatum } from "../../types/types";

const MAX_LABEL_LENGTH = 22;
const CARD_RADIUS = 8;

const formatLabel = (value: string) => {
  const title = capitalize(value || "");
  if (title.length <= MAX_LABEL_LENGTH) return title;
  return `${title.slice(0, MAX_LABEL_LENGTH)}…`;
};

const isFolderNode = (node: NodeDatum) =>
  !!node.folderId || node.id.startsWith("folder-");

const isCategoryNode = (node: NodeDatum) => node.id.startsWith("category-");

type RootLayerCardsProps = {
  nodes: NodeDatum[];
};

export const RootLayerCards: React.FC<RootLayerCardsProps> = ({ nodes }) => {
  const { colorScheme } = useColorScheme();
  const { setParams } = useRouter();
  const graphMode = useGraphStore((state) => state.mode);

  if (nodes.length === 0) return null;

  return (
    <View className="flex-row flex-wrap items-start gap-2">
      {nodes.map((node) => {
        const categoryKey = resolveNodeCategoryKey(node);
        const showCategoryStripe =
          graphMode === "category" && (isCategoryNode(node) || !!categoryKey);
        const stripeColor = categoryKey
          ? hsl(categoryKey, colorScheme, undefined, "categories")
          : hsl("border", colorScheme);
        const iconName =
          graphMode === "category" || isCategoryNode(node)
            ? ("shapes" as const)
            : isFolderNode(node) || graphMode === "folder"
              ? ("folder" as const)
              : ("shapes" as const);

        return (
          <Pressable
            key={node.id}
            onPress={() => {
              setParams({
                id: node.id,
                _t: Date.now().toString(),
              });
              onGraphBreadcrumbNavigate(node.id);
            }}
            accessibilityRole="button"
            accessibilityLabel={`Open ${node.name || "item"}`}
            className="bg-card border-border border rounded-lg overflow-hidden self-start"
            style={{ borderRadius: CARD_RADIUS, overflow: "hidden" }}
          >
            <View
              className="flex-row items-stretch overflow-hidden"
              style={{ borderRadius: CARD_RADIUS, overflow: "hidden" }}
            >
              {showCategoryStripe ? (
                <View
                  className="self-stretch"
                  style={{
                    backgroundColor: stripeColor,
                    width: 4,
                    borderTopLeftRadius: CARD_RADIUS,
                    borderBottomLeftRadius: CARD_RADIUS,
                  }}
                />
              ) : null}
              <View className="flex-row items-center gap-2 px-2.5 py-2">
                <Icon name={iconName} color="muted-foreground" size={16} />
                <Typography variant="h4" numberOfLines={1} className="max-w-40">
                  {formatLabel(node.name || node.title || "")}
                </Typography>
                {node.children?.length ? (
                  <Typography
                    variant="p"
                    className="text-muted-foreground text-xs"
                  >
                    {node.children.length}
                  </Typography>
                ) : null}
              </View>
            </View>
          </Pressable>
        );
      })}
    </View>
  );
};
