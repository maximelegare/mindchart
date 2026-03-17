import React, { useCallback, useState } from "react";
import { View } from "react-native";
import { useFocusEffect } from "expo-router";
import { useGraph } from "../hooks/useGraph";
import CirclePackSkia from "../components/graphSkia";
import GraphInfos from "../components/graphInfos/graphInfos";
import { NodeDatum } from "../types/types";
import { SpaceFiller } from "@/components/ui/spaceFiller";
import { Button, Typography } from "@/components/ui";

export const GraphFeature = ({
  focusedThoughtId,
  trigger,
}: {
  focusedThoughtId?: string;
  trigger?: string;
}) => {
  const { hierarchy, refetchGraph, refetchSyncFlag, rebuildGraph } = useGraph();

  const [selection, setSelection] = useState<{
    active: NodeDatum | null;
    parent: NodeDatum | null;
  }>({ active: null, parent: null });

  useFocusEffect(
    useCallback(() => {
      refetchGraph();
      refetchSyncFlag();
    }, [])
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

  if (!hierarchy) return null;

  return (
    <View className="flex-col gap-4 items-center flex-1">
      <Button onPress={rebuildGraph}>
        <Typography>Rebuild Graph</Typography>
      </Button>
      <CirclePackSkia
        data={hierarchy}
        focusedThoughtId={focusedThoughtId}
        trigger={trigger}
        onNodeSelected={handleNodeSelected}
      />

      <View className="w-full flex-1">
        <GraphInfos
          activeNode={selection.active}
          parentNode={selection.parent}
        />
      </View>
      <SpaceFiller
        sizes={{ paddingBottom: ["TAB_BAR_HEIGHT", "HEADER_OVERLAP"] }}
      />
    </View>
  );
};
