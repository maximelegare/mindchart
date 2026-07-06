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
      <LoadingState title="Loading graph" size="large" />
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    width: GRAPH_CANVAS_SIZE,
    height: GRAPH_CANVAS_SIZE,
    borderWidth: 1,
    borderRadius: 12,
    alignSelf: "center",
    marginTop: 10,
    alignItems: "center",
    justifyContent: "center",
  },
});
