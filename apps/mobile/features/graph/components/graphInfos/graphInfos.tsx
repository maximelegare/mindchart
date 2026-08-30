import React, { memo, useMemo } from "react";
import { View } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { Typography } from "@/components/ui/typography";
import { NodeDatum } from "@/features/graph/types/types";
import { GRAPH_CANVAS_SIZE } from "@/features/graph/constants";
import { isSyntheticRoot } from "@/features/graph/utils/filterGraphHierarchy";
import { RootLayerCards } from "./rootLayerCards";
import { SelectedLayerCard } from "./selectedLayerCard";

interface Props {
  hierarchy: NodeDatum | null;
  activeNode: NodeDatum | null;
  focusedThoughtId?: string;
}

/** True when `targetId` is `node` or a descendant (does not use findNodePath fallback). */
function containsNode(node: NodeDatum, targetId: string): boolean {
  if (node.id === targetId) return true;
  return (node.children ?? []).some((child) => containsNode(child, targetId));
}

/**
 * Card root for the infos panel — same for folder and category:
 * stay on the first selected pack (category or folder) and only change
 * which descendant label is highlighted.
 */
function findLayerRoot(hierarchy: NodeDatum, activeNode: NodeDatum): NodeDatum {
  if (activeNode.id === hierarchy.id || activeNode.id === "root") {
    return activeNode;
  }

  // Pack is already rooted at the first selected folder/category.
  if (!isSyntheticRoot(hierarchy)) {
    return hierarchy;
  }

  for (const child of hierarchy.children ?? []) {
    if (containsNode(child, activeNode.id)) return child;
  }

  return activeNode;
}

const GraphInfos = memo(function GraphInfos({
  hierarchy,
  activeNode,
  focusedThoughtId,
}: Props) {
  const isRootLayer = useMemo(() => {
    if (!activeNode) return true;
    if (!hierarchy) return activeNode.id === "root";
    return activeNode.id === hierarchy.id || activeNode.id === "root";
  }, [activeNode, hierarchy]);

  /** Flat chips only for the synthetic graph root — a filtered folder root uses the tree card. */
  const showRootCards = useMemo(() => {
    if (!isRootLayer) return false;
    const root = hierarchy ?? activeNode;
    return !!root && isSyntheticRoot(root);
  }, [activeNode, hierarchy, isRootLayer]);

  const rootChildren = useMemo(() => {
    if (!hierarchy?.children?.length) {
      if (!activeNode) return [];
      return activeNode.children ?? [activeNode];
    }
    return hierarchy.children;
  }, [activeNode, hierarchy]);

  const layerRoot = useMemo(() => {
    if (!activeNode) return null;
    if (showRootCards) return null;
    // Folder (or category) used as hierarchy root — show it as the tree card.
    if (hierarchy && !isSyntheticRoot(hierarchy)) {
      return hierarchy;
    }
    if (isRootLayer) return null;
    return findLayerRoot(hierarchy ?? activeNode, activeNode);
  }, [activeNode, hierarchy, isRootLayer, showRootCards]);

  return (
    <View
      style={{
        width: GRAPH_CANVAS_SIZE,
        alignSelf: "center",
        flex: 1,
      }}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingBottom: 8 }}
      >
        {showRootCards ? (
          rootChildren.length > 0 ? (
            <RootLayerCards nodes={rootChildren} />
          ) : (
            <Typography className="text-center py-10 opacity-50">
              Select a node to see details
            </Typography>
          )
        ) : layerRoot && activeNode ? (
          <SelectedLayerCard
            layerRoot={layerRoot}
            currentNodeId={activeNode.id}
            focusedThoughtId={focusedThoughtId}
          />
        ) : (
          <Typography className="text-center py-10 opacity-50">
            Select a node to see details
          </Typography>
        )}
      </ScrollView>
    </View>
  );
});

export default GraphInfos;
