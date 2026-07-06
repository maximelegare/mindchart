import ModeToggle from "@/components/ui/modeToggle";
import { View } from "react-native";
import { PageOptionsHeaderContainer } from "@/components/layout/page/pageOptionsHeaderContainer";
import { useGraphStore } from "../context/graphContext";

export const GraphModeToggle = () => {
  const mode = useGraphStore((state) => state.mode);
  const setGraphMode = useGraphStore((state) => state.setGraphMode);

  return (
    <PageOptionsHeaderContainer>
      <View className="flex-row items-center justify-start">
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
    </PageOptionsHeaderContainer>
  );
};
