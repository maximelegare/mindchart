import React, { memo, useEffect, useMemo, useState } from "react";
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

/** Map every descendant id → first-level pack (O(n) once, O(1) per click). */
function buildLayerRootIndex(hierarchy: NodeDatum): Map<string, NodeDatum> {
  const index = new Map<string, NodeDatum>();
  for (const child of hierarchy.children ?? []) {
    const walk = (node: NodeDatum) => {
      index.set(node.id, child);
      if (node.thoughtId) index.set(node.thoughtId, child);
      if (node.noteId) {
        index.set(node.noteId, child);
        index.set(`note-${node.noteId}`, child);
      }
      node.children?.forEach(walk);
    };
    walk(child);
  }
  return index;
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

  const layerRootIndex = useMemo(
    () => (hierarchy ? buildLayerRootIndex(hierarchy) : null),
    [hierarchy]
  );

  const layerRoot = useMemo(() => {
    if (!activeNode) return null;
    if (showRootCards) return null;
    // Folder (or category) used as hierarchy root — show it as the tree card.
    if (hierarchy && !isSyntheticRoot(hierarchy)) {
      return hierarchy;
    }
    if (isRootLayer) return null;
    if (activeNode.id === hierarchy?.id || activeNode.id === "root") {
      return activeNode;
    }
    return layerRootIndex?.get(activeNode.id) ?? activeNode;
  }, [activeNode, hierarchy, isRootLayer, layerRootIndex, showRootCards]);

  const [cachedLayer, setCachedLayer] = useState<{
    root: NodeDatum;
    currentNodeId: string;
    focusedThoughtId?: string;
  } | null>(null);

  useEffect(() => {
    if (!showRootCards && layerRoot && activeNode) {
      setCachedLayer({
        root: layerRoot,
        currentNodeId: activeNode.id,
        focusedThoughtId,
      });
    }
  }, [activeNode, focusedThoughtId, layerRoot, showRootCards]);

  const mountedLayer = showRootCards ? cachedLayer?.root : layerRoot;
  const mountedCurrentId = showRootCards
    ? cachedLayer?.currentNodeId
    : activeNode?.id;
  const mountedFocusId = showRootCards
    ? cachedLayer?.focusedThoughtId
    : focusedThoughtId;

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
        {rootChildren.length > 0 ? (
          <View style={{ display: showRootCards ? "flex" : "none" }}>
            <RootLayerCards nodes={rootChildren} />
          </View>
        ) : showRootCards ? (
          <Typography className="text-center py-10 opacity-50">
            Select a node to see details
          </Typography>
        ) : null}
        {mountedLayer && mountedCurrentId ? (
          <View style={{ display: showRootCards ? "none" : "flex" }}>
            <SelectedLayerCard
              layerRoot={mountedLayer}
              currentNodeId={mountedCurrentId}
              focusedThoughtId={mountedFocusId}
            />
          </View>
        ) : !showRootCards ? (
          <Typography className="text-center py-10 opacity-50">
            Select a node to see details
          </Typography>
        ) : null}
      </ScrollView>
    </View>
  );
});

export default GraphInfos;
