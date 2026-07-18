import ModeToggle from "@/components/ui/modeToggle";
import { PageOptionsHeaderContainer } from "@/components/layout/page/pageOptionsHeaderContainer";
import { memo, useEffect, useState } from "react";
import { useGraphStore } from "../context/graphContext";
import { GraphMode } from "../types/types";
import { GraphFilterChips } from "./graphFilterChips";

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

  const modeToggle = (
    <ModeToggle
      values={MODE_VALUES}
      currentMode={mode}
      onToggle={(nextMode) => {
        const next: GraphMode = nextMode === "topic" ? "topic" : "category";
        useGraphStore.getState().setGraphMode(next);
      }}
    />
  );

  return (
    <PageOptionsHeaderContainer>
      <GraphFilterChips leading={modeToggle} />
    </PageOptionsHeaderContainer>
  );
});
