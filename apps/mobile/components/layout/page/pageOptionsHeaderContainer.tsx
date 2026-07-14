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
    <View
      className="border-b border-border bg-card w-full"
      style={styles.container}
    >
      <View
        className="justify-center"
        style={{ height: LAYOUT_SIZES.OPTIONS_HEADER_HEIGHT }}
      >
        <Gutter size="md">{children}</Gutter>
      </View>
      {footer}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: "hidden",
  },
});
