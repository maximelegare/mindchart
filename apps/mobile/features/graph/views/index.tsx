import React, { useCallback, useEffect, useMemo, useState } from "react";
import { View } from "react-native";
import { useFocusEffect } from "expo-router";
import { useGraphStore } from "../context/graphContext";
import { useGraph } from "../hooks/useGraph";
import CirclePackSkia from "../components/graphSkia";
import { GraphLoadingPlaceholder } from "../components/graphLoadingPlaceholder";
import GraphInfos from "../components/graphInfos/graphInfos";
import { NodeDatum } from "../types/types";
import { SpaceFiller } from "@/components/ui/spaceFiller";
import { usePageScroll } from "@/components/layout/page/pageContainer";
import { filterGraphHierarchy } from "../utils/filterGraphHierarchy";
import { findNodeById, findNodePath } from "../utils/findNodePath";
import { setGraphPageScrollToTop } from "../utils/focusGraphNode";

export const GraphFeature = ({
  focusedThoughtId,
  trigger,
}: {
  focusedThoughtId?: string;
  trigger?: string;
}) => {
  const renderMode = useGraphStore((state) => state.renderMode);
  const selectedFolderId = useGraphStore((state) => state.selectedFolderId);
  const selectedCategoryId = useGraphStore((state) => state.selectedCategoryId);
  const categoryFolderMergeDepth = useGraphStore(
    (state) => state.categoryFolderMergeDepth
  );
  const { hierarchies, isLoading, refetchGraph, refetchSyncFlag } = useGraph();
  const { scrollToTop } = usePageScroll();

  useEffect(() => {
    setGraphPageScrollToTop(scrollToTop);
    return () => setGraphPageScrollToTop(null);
  }, [scrollToTop]);

  const hierarchy = useMemo(() => {
    if (!hierarchies) return null;
    return filterGraphHierarchy(
      hierarchies[renderMode],
      renderMode,
      selectedFolderId,
      selectedCategoryId
    );
  }, [hierarchies, renderMode, selectedFolderId, selectedCategoryId]);

  const [selection, setSelection] = useState<{
    active: NodeDatum | null;
    parent: NodeDatum | null;
  }>({ active: null, parent: null });

  useFocusEffect(
    useCallback(() => {
      refetchGraph();
      refetchSyncFlag();
    }, [refetchGraph, refetchSyncFlag])
  );

  const handleNodeSelected = useCallback(
    (node: NodeDatum, parent?: NodeDatum) => {
      setSelection({
        active: node,
        parent: parent || null,
      });
    },
    []
  );

  useEffect(() => {
    setSelection({ active: null, parent: null });
  }, [
    renderMode,
    selectedFolderId,
    selectedCategoryId,
    categoryFolderMergeDepth,
  ]);

  // Clicks pass layout-cache snapshots; replace them with the live tree node
  // so title/summary edits (and the Titles toggle) show up immediately.
  useEffect(() => {
    if (!hierarchy || !selection.active) return;
    const fresh = findNodeById(hierarchy, selection.active.id);
    if (!fresh) {
      setSelection({ active: null, parent: null });
      return;
    }
    if (fresh === selection.active) return;
    const path = findNodePath(hierarchy, fresh.id);
    const parent = path.length > 1 ? path[path.length - 2] : null;
    setSelection({ active: fresh, parent });
  }, [hierarchy, selection.active]);

  const activeNode = selection.active ?? hierarchy;

  useEffect(() => {
    useGraphStore
      .getState()
      .setBreadcrumbNav(hierarchy, activeNode?.id ?? null);
  }, [activeNode?.id, hierarchy]);

  if (isLoading || !hierarchy) {
    return (
      <View className="flex-col gap-4 items-center flex-1">
        <GraphLoadingPlaceholder />
        <SpaceFiller
          sizes={{ paddingBottom: ["TAB_BAR_HEIGHT", "HEADER_OVERLAP"] }}
        />
      </View>
    );
  }

  return (
    <View className="flex-col gap-4 items-center flex-1">
      <CirclePackSkia
        data={hierarchy}
        graphMode={renderMode}
        focusedThoughtId={focusedThoughtId}
        trigger={trigger}
        onNodeSelected={handleNodeSelected}
      />

      <GraphInfos
        hierarchy={hierarchy}
        activeNode={activeNode}
        focusedThoughtId={
          focusedThoughtId && focusedThoughtId !== activeNode?.id
            ? focusedThoughtId
            : undefined
        }
      />
      <SpaceFiller
        sizes={{ paddingBottom: ["TAB_BAR_HEIGHT", "HEADER_OVERLAP"] }}
      />
    </View>
  );
};
