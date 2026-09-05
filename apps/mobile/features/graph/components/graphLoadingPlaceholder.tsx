import { LoadingState } from "@/components/ui/modal/custom/loadingState/loadingState";
import { hsl } from "@/utils/hsl";
import { useColorScheme } from "@/lib/useColorScheme";
import { View, StyleSheet } from "react-native";
import { GRAPH_CANVAS_SIZE } from "../constants";
import { GraphModeTabs } from "./graphModeTabs";

export const GraphLoadingPlaceholder = () => {
  const { colorScheme } = useColorScheme();
  const scheme = colorScheme === "dark" ? "dark" : "light";

  return (
    <View
      style={[
        styles.wrapper,
        {
          backgroundColor: hsl("card", "theme", scheme),
        },
      ]}
    >
      <View style={styles.header}>
        <GraphModeTabs />
      </View>
      <View style={styles.canvasArea}>
        <LoadingState title="Loading graph" size="large" />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    width: GRAPH_CANVAS_SIZE,
    borderRadius: 18,
    overflow: "hidden",
    alignSelf: "center",
    marginTop: 10,
  },
  header: {
    width: "100%",
  },
  canvasArea: {
    width: GRAPH_CANVAS_SIZE,
    height: GRAPH_CANVAS_SIZE,
    alignItems: "center",
    justifyContent: "center",
  },
});
