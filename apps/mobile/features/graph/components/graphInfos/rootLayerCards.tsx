import React, { useMemo } from "react";
import { Pressable, View } from "react-native";
import { useRouter } from "expo-router";
import { Typography } from "@/components/ui/typography";
import { Icon } from "@/components/ui/icons/icon";
import { useControllers } from "@/api/controllers/useControllers";
import { useColorScheme } from "@/lib/useColorScheme";
import { hsl } from "@/utils/hsl";
import capitalize from "@/utils/stringManipulations/capitalize";
import { FolderActionsMenu } from "@/features/contentList/features/folderContents/components/folderActionsMenu";
import { onGraphBreadcrumbNavigate } from "@/features/navigation/syncLinkedBreadcrumbs";
import { useGraphStore } from "../../context/graphContext";
import { isRealFolderNode } from "../../utils/buildGraphByFolder";
import { resolveNodeCategoryKey } from "../../utils/resolveNodeCategoryKey";
import type { NodeDatum } from "../../types/types";

const MAX_LABEL_LENGTH = 22;
const CARD_RADIUS = 18;

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
  const { folders } = useControllers();
  const { data: allFolders = [] } = folders.useFetchAllFoldersQuery({
    enabled: graphMode === "folder",
  });
  const foldersById = useMemo(
    () => new Map(allFolders.map((folder) => [folder.id, folder])),
    [allFolders]
  );

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

        const navigate = () => {
          setParams({
            id: node.id,
            _t: Date.now().toString(),
          });
          onGraphBreadcrumbNavigate(node.id);
        };

        const card = (
          <View
            className="bg-card rounded-2xl overflow-hidden self-start"
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
              <View className="flex-row items-center gap-2 px-3.5 py-2.5">
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
          </View>
        );

        const folder =
          graphMode === "folder" && isRealFolderNode(node) && node.folderId
            ? (foldersById.get(node.folderId) ?? null)
            : null;

        if (folder) {
          return (
            <FolderActionsMenu
              key={node.id}
              target={{ kind: "folder", folder }}
              onNavigate={navigate}
              className="shrink-0"
            >
              {card}
            </FolderActionsMenu>
          );
        }

        return (
          <Pressable
            key={node.id}
            onPress={navigate}
            accessibilityRole="button"
            accessibilityLabel={`Open ${node.name || "item"}`}
          >
            {card}
          </Pressable>
        );
      })}
    </View>
  );
};
