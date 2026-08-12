import ModeToggle from "@/components/ui/modeToggle";
import { useGraphStore } from "../context/graphContext";
import type { GraphMode } from "../types/types";

const GRAPH_MODE_VALUES = {
  first: { name: "category", icon: "shapes" as const },
  second: { name: "folder", icon: "folder" as const },
};

/** Mic/keyboard-style toggle for Categories ↔ Folders. */
export const GraphModeTabs = () => {
  const mode = useGraphStore((state) => state.mode);
  const setGraphMode = useGraphStore((state) => state.setGraphMode);

  return (
    <ModeToggle
      values={GRAPH_MODE_VALUES}
      currentMode={mode}
      onToggle={(next) => setGraphMode(next as GraphMode)}
    />
  );
};
