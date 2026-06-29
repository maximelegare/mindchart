import React, { useCallback, useEffect, useState } from "react";
import { View } from "react-native";
import { useFocusEffect } from "expo-router";
import { useGraphStore } from "../context/graphContext";
import { useGraph } from "../hooks/useGraph";
import CirclePackSkia from "../components/graphSkia";
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
  const mode = useGraphStore((state) => state.mode);
  const { hierarchy, refetchGraph, refetchSyncFlag } = useGraph(mode);

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
  }, [mode]);

  if (!hierarchy) return null;

  return (
    <View className="flex-col gap-4 items-center flex-1">
      <CirclePackSkia
        key={mode}
        data={hierarchy}
        focusedThoughtId={focusedThoughtId}
        trigger={trigger}
        onNodeSelected={handleNodeSelected}
      />

      <View className="w-full flex-1">
        <GraphInfos
          hierarchy={hierarchy}
          activeNode={selection.active}
          focusedThoughtId={focusedThoughtId}
        />
      </View>
      <SpaceFiller
        sizes={{ paddingBottom: ["TAB_BAR_HEIGHT", "HEADER_OVERLAP"] }}
      />
    </View>
  );
};
