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

export const GraphFeature = ({
  focusedThoughtId,
  trigger,
}: {
  focusedThoughtId?: string;
  trigger?: string;
}) => {
  const renderMode = useGraphStore((state) => state.renderMode);
  const { hierarchies, isLoading, refetchGraph, refetchSyncFlag } = useGraph();

  const hierarchy = useMemo(
    () => (hierarchies ? hierarchies[renderMode] : null),
    [hierarchies, renderMode]
  );

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
  }, [renderMode]);

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

  const activeNode = selection.active ?? hierarchy;

  return (
    <View className="flex-col gap-4 items-center flex-1">
      <CirclePackSkia
        data={hierarchy}
        focusedThoughtId={focusedThoughtId}
        trigger={trigger}
        onNodeSelected={handleNodeSelected}
      />

      <View className="w-full flex-1">
        <GraphInfos
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
