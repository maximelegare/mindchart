import { type ReactNode } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { Typography } from "@/components/ui/typography";
import { tabIconMap } from "./icons.map";
import { Icon } from "@/components/ui/icons/icon";
import { useColorScheme } from "@/lib/useColorScheme";
import { hsl } from "@/utils/hsl";
import { LOGO_CHART_COLOR } from "@/components/ui/logo";
import { LAYOUT_SIZES } from "../constants";

type TabBarButtonProps = {
  routeName: string;
  onPress: () => void;
  isFocused: boolean;
  label: ReactNode;
  accessibilityLabel: string;
  bottomInset: number;
};

export const TabBarButton = ({
  routeName,
  onPress,
  isFocused,
  label,
  accessibilityLabel,
  bottomInset,
}: TabBarButtonProps) => {
  const { colorScheme } = useColorScheme();
  const labelColor = isFocused
    ? LOGO_CHART_COLOR
    : hsl("muted-foreground", colorScheme);

  return (
    <Pressable
      onPress={onPress}
      android_ripple={null}
      style={[
        styles.pressable,
        { height: LAYOUT_SIZES.TAB_BAR_HEIGHT + bottomInset },
      ]}
      accessibilityRole="tab"
      accessibilityState={{ selected: isFocused }}
      accessibilityLabel={accessibilityLabel}
    >
      <View style={[styles.content, { height: LAYOUT_SIZES.TAB_BAR_HEIGHT }]}>
        <Icon
          name={tabIconMap[routeName]}
          color={isFocused ? "primary" : "muted-foreground"}
          hslColor={isFocused ? LOGO_CHART_COLOR : undefined}
          opacity={isFocused ? 100 : 62}
        />
        <Typography
          variant="p"
          className="text-xs"
          style={{
            color: labelColor,
            fontFamily: "QuicksandRegular",
            opacity: isFocused ? 1 : 0.72,
          }}
        >
          {label}
        </Typography>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  pressable: {
    flex: 1,
  },
  content: {
    alignItems: "center",
    justifyContent: "center",
    gap: 2,
    transform: [{ translateY: 3 }],
  },
});
