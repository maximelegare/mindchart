import { Pressable, View } from "react-native";
import React from "react";
import { hsl } from "@/utils/hsl";
import { useColorScheme } from "@/lib/useColorScheme";
import { FilterChipProps } from "./filterChips";
import { Icon } from "@/components/ui/icons/icon";
import { Typography } from "@/components/ui";

type FunnelFilterChipProps = FilterChipProps & {
  showDot?: boolean;
};

export const FunnelFilterChip = React.forwardRef<
  React.ElementRef<typeof Pressable>,
  FunnelFilterChipProps
>(function FunnelFilterChip(
  {
    label,
    selected = false,
    colorBadge,
    onPress,
    icon,
    showDot = false,
    ...props
  },
  ref
) {
  const { colorScheme } = useColorScheme();
  const selectedFg = hsl("text", colorScheme);
  const mutedFg = hsl("muted-foreground", colorScheme);
  const backgroundColor = hsl(selected ? "muted" : "card", colorScheme);
  const borderColor = hsl(selected ? "border" : "card", colorScheme);
  const dotColor = hsl("popover", colorScheme);

  return (
    <Pressable
      ref={ref}
      onPress={onPress}
      className="relative min-w-10 flex-row items-center gap-1.5 rounded-full border px-3 py-2"
      style={{ backgroundColor, borderColor }}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      {...props}
    >
      {showDot ? (
        <View
          className="absolute h-2 w-2 rounded-full z-10"
          style={{ backgroundColor: dotColor, right: 8, top: 5 }}
          accessibilityElementsHidden
          importantForAccessibility="no"
        />
      ) : null}
      {colorBadge ? (
        <View
          className="h-2.5 w-2.5 rounded-full"
          style={{ backgroundColor: colorBadge }}
        />
      ) : null}
      {icon ? (
        <Icon
          name={icon}
          color={selected ? "text" : "muted-foreground"}
          size={16}
        />
      ) : null}
      {label ? (
        <Typography
          variant="p"
          className="text-xs"
          style={{ color: selected ? selectedFg : mutedFg }}
        >
          {label}
        </Typography>
      ) : null}
    </Pressable>
  );
});
