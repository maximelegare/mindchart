import { View, StyleSheet } from "react-native";
import { Gutter } from "@/components/ui/gutter";
import { LAYOUT_SIZES } from "../constants";
import { useColorScheme } from "@/lib/useColorScheme";
import { hsl } from "@/utils/hsl";

type PageOptionsHeaderContainerProps = {
  children?: React.ReactNode;
  footer?: React.ReactNode;
};

export const PageOptionsHeaderContainer = ({
  children,
  footer,
}: PageOptionsHeaderContainerProps) => {
  const { colorScheme } = useColorScheme();
  const backgroundColor = hsl("background", colorScheme);

  return (
    <View style={styles.clip} collapsable={false}>
      <View style={[styles.surface, { backgroundColor }]}>
        <View
          className="justify-center"
          style={{ height: LAYOUT_SIZES.OPTIONS_HEADER_HEIGHT }}
        >
          <Gutter size="md">{children ?? <View />}</Gutter>
        </View>
        {footer}
      </View>
      {children ? (
        <View className="border-b border-border" style={styles.bottomEdge} />
      ) : null}
    </View>
  );
};

const RADIUS = 24;

const styles = StyleSheet.create({
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
    width: "100%",
  },
  bottomEdge: {
    width: "100%",
  },
});
