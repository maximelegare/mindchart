import ModeToggle from "@/components/ui/modeToggle";
import { memo, useEffect, useState } from "react";
import { View } from "react-native";
import { PageOptionsHeaderContainer } from "@/components/layout/page/pageOptionsHeaderContainer";
import { useGraphStore } from "../context/graphContext";
import { GraphMode } from "../types/types";

const MODE_VALUES = {
  first: { name: "category", icon: "shapes" as const },
  second: { name: "topic", icon: "tag" as const },
};

export const GraphModeToggle = memo(function GraphModeToggle() {
  const [mode, setMode] = useState<GraphMode>(
    () => useGraphStore.getState().mode
  );

  useEffect(
    () =>
      useGraphStore.subscribe((state, prevState) => {
        if (state.mode !== prevState.mode) {
          setMode(state.mode);
        }
      }),
    []
  );

  return (
    <PageOptionsHeaderContainer>
      <View className="flex-row items-center justify-start">
        <ModeToggle
          values={MODE_VALUES}
          currentMode={mode}
          onToggle={(nextMode) => {
            const next: GraphMode = nextMode === "topic" ? "topic" : "category";
            useGraphStore.getState().setGraphMode(next);
          }}
        />
      </View>
    </PageOptionsHeaderContainer>
  );
});
