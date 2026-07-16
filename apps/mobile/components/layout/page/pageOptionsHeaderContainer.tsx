import { View, StyleSheet } from "react-native";
import { Gutter } from "@/components/ui/gutter";
import { LAYOUT_SIZES } from "../constants";

type PageOptionsHeaderContainerProps = {
  children: React.ReactNode;
  footer?: React.ReactNode;
};

export const PageOptionsHeaderContainer = ({
  children,
  footer,
}: PageOptionsHeaderContainerProps) => {
  return (
    <View style={styles.clip} collapsable={false}>
      <View className="bg-background w-full" style={styles.surface}>
        <View
          className="justify-center"
          style={{ height: LAYOUT_SIZES.OPTIONS_HEADER_HEIGHT }}
        >
          <Gutter size="md">{children}</Gutter>
        </View>
        {footer}
      </View>
      <View className="border-b border-border" style={styles.bottomEdge} />
    </View>
  );
};

const RADIUS = 24;

const styles = StyleSheet.create({
  // Outer clip — keeps backgrounds from bleeding past the radius by 1px.
  clip: {
    borderTopLeftRadius: RADIUS,
    borderTopRightRadius: RADIUS,
    overflow: "hidden",
    width: "100%",
  },
  surface: {
    borderTopLeftRadius: RADIUS,
    borderTopRightRadius: RADIUS,
    overflow: "hidden",
  },
  bottomEdge: {
    width: "100%",
  },
});
