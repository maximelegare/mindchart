import React, { useCallback, useEffect, useState } from "react";
import { View } from "react-native";
import { useFocusEffect } from "expo-router";
import { useGraph } from "../hooks/useGraph";
import CirclePackSkia from "../components/graphSkia";
import GraphInfos from "../components/graphInfos/graphInfos";
import { GraphMode, NodeDatum } from "../types/types";
import { SpaceFiller } from "@/components/ui/spaceFiller";
import ModeToggle from "@/components/ui/modeToggle";

export const GraphFeature = ({
  mode,
  onModeChange,
  focusedThoughtId,
  trigger,
}: {
  mode: GraphMode;
  onModeChange: (mode: GraphMode) => void;
  focusedThoughtId?: string;
  trigger?: string;
}) => {
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

  const handleModeToggle = useCallback(
    (nextMode: string) => {
      onModeChange(nextMode === "topic" ? "topic" : "category");
    },
    [onModeChange]
  );

  useEffect(() => {
    setSelection({ active: null, parent: null });
  }, [mode]);

  if (!hierarchy) return null;

  return (
    <View className="flex-col gap-4 items-center flex-1">
      <View className="w-full flex-row justify-end px-3">
        <ModeToggle
          values={{
            first: { name: "category", icon: "layers" },
            second: { name: "topic", icon: "tag" },
          }}
          currentMode={mode}
          onToggle={handleModeToggle}
        />
      </View>

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
          graphMode={mode}
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
