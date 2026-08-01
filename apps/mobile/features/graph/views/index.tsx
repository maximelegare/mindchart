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
import { filterGraphHierarchy } from "../utils/filterGraphHierarchy";

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
  const { hierarchies, isLoading, refetchGraph, refetchSyncFlag } = useGraph();

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
  }, [renderMode, selectedFolderId, selectedCategoryId]);

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

      <View className="w-full flex-1">
        <GraphInfos
          hierarchy={hierarchy}
          activeNode={activeNode}
          focusedThoughtId={focusedThoughtId}
        />
      </View>
      <SpaceFiller
        sizes={{ paddingBottom: ["TAB_BAR_HEIGHT", "HEADER_OVERLAP"] }}
      />
    </View>
  );
};
