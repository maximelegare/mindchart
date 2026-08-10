import React, { memo, useMemo } from "react";
import { ScrollView, View } from "react-native";
import { Typography } from "@/components/ui/typography";
import { NodeDatum } from "@/features/graph/types/types";
import { GRAPH_CANVAS_SIZE } from "@/features/graph/constants";
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

/** Top-level child of the graph root that contains (or is) the active node. */
function findLayerRoot(hierarchy: NodeDatum, activeNode: NodeDatum): NodeDatum {
  if (activeNode.id === hierarchy.id || activeNode.id === "root") {
    return activeNode;
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

  const rootChildren = useMemo(() => {
    if (!hierarchy?.children?.length) {
      if (!activeNode) return [];
      return activeNode.children ?? [activeNode];
    }
    return hierarchy.children;
  }, [activeNode, hierarchy]);

  const layerRoot = useMemo(() => {
    if (!activeNode || isRootLayer) return null;
    if (!hierarchy) return activeNode;
    return findLayerRoot(hierarchy, activeNode);
  }, [activeNode, hierarchy, isRootLayer]);

  return (
    <View
      style={{
        width: GRAPH_CANVAS_SIZE,
        alignSelf: "center",
        flex: 1,
      }}
    >
      <ScrollView showsVerticalScrollIndicator={false}>
        {isRootLayer ? (
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
