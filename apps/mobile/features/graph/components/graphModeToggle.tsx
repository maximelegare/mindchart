import ModeToggle from "@/components/ui/modeToggle";
import { Gutter } from "@/components/ui/gutter";
import { View } from "react-native";
import { useGraphStore } from "../context/graphContext";

export const GraphModeToggle = () => {
  const mode = useGraphStore((state) => state.mode);
  const setGraphMode = useGraphStore((state) => state.setGraphMode);

  return (
    <Gutter size="md">
      <View className="flex-row items-center justify-end">
        <ModeToggle
          values={{
            first: { name: "category", icon: "shapes" },
            second: { name: "topic", icon: "tag" },
          }}
          currentMode={mode}
          onToggle={(nextMode) =>
            setGraphMode(nextMode === "topic" ? "topic" : "category")
          }
        />
      </View>
    </Gutter>
  );
};
