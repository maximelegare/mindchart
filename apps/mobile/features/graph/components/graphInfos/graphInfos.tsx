import React, { memo, useMemo } from "react";
import { ScrollView, View } from "react-native";
import { Typography } from "@/components/ui/typography";
import { NodeDatum } from "@/features/graph/types/types";
import { GRAPH_CANVAS_SIZE } from "@/features/graph/constants";
import { isSyntheticRoot } from "@/features/graph/utils/filterGraphHierarchy";
import { isNoteLeafId } from "@/features/graph/utils/mapNoteToLeaf";
import { useGraphStore } from "@/features/graph/context/graphContext";
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

function findParentNode(root: NodeDatum, targetId: string): NodeDatum | null {
  for (const child of root.children ?? []) {
    if (child.id === targetId) return root;
    const found = findParentNode(child, targetId);
    if (found) return found;
  }
  return null;
}

const isFolderPack = (node: NodeDatum) =>
  !isNoteLeafId(node.id) &&
  !node.thoughtId &&
  (!!node.folderId || node.id.startsWith("folder-"));

/**
 * Card root for the infos panel.
 * - Category mode: top-level category that contains the selection (folders under it collapse).
 * - Folder mode: the zoomed folder itself (or the note's parent folder), so nested
 *   folders under it get the same expand/collapse chevrons as category mode.
 */
function findLayerRoot(
  hierarchy: NodeDatum,
  activeNode: NodeDatum,
  mode: "folder" | "category"
): NodeDatum {
  if (activeNode.id === hierarchy.id || activeNode.id === "root") {
    return activeNode;
  }

  if (mode === "folder") {
    if (isFolderPack(activeNode)) return activeNode;
    const parent = findParentNode(hierarchy, activeNode.id);
    if (parent && isFolderPack(parent)) return parent;
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
  const graphMode = useGraphStore((state) => state.mode);

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
    if (isRootLayer && hierarchy && !isSyntheticRoot(hierarchy)) {
      return hierarchy;
    }
    if (isRootLayer) return null;
    if (!hierarchy) return activeNode;
    return findLayerRoot(hierarchy, activeNode, graphMode);
  }, [activeNode, graphMode, hierarchy, isRootLayer, showRootCards]);

  return (
    <View
      style={{
        width: GRAPH_CANVAS_SIZE,
        alignSelf: "center",
        flex: 1,
      }}
    >
      <ScrollView showsVerticalScrollIndicator={false}>
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
