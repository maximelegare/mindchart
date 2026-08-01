import { LoadingState } from "@/components/ui/modal/custom/loadingState/loadingState";
import { hsl } from "@/utils/hsl";
import { useColorScheme } from "@/lib/useColorScheme";
import { View, StyleSheet } from "react-native";
import { GRAPH_CANVAS_SIZE } from "../constants";

export const GraphLoadingPlaceholder = () => {
  const { colorScheme } = useColorScheme();

  return (
    <View
      style={[
        styles.wrapper,
        {
          backgroundColor: hsl("card", colorScheme),
          borderColor: hsl("border", colorScheme),
        },
      ]}
    >
      <View style={styles.canvasArea}>
        <LoadingState title="Loading graph" size="large" />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    width: GRAPH_CANVAS_SIZE,
    borderWidth: 1,
    borderRadius: 12,
    overflow: "hidden",
    alignSelf: "center",
    marginTop: 10,
  },
  canvasArea: {
    width: GRAPH_CANVAS_SIZE,
    height: GRAPH_CANVAS_SIZE,
    alignItems: "center",
    justifyContent: "center",
  },
});
