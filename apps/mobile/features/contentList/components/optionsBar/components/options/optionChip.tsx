import { IconName } from "@/components/ui/icons/icon-registry";
import { Pressable, View } from "react-native";
import React from "react";
import { useColorScheme } from "@/lib/useColorScheme";
import { hsl } from "@/utils/hsl";
import { Icon } from "@/components/ui/icons/icon";
import { Button, Typography } from "@/components/ui";
import { cn } from "@/lib/cn";

export type OptionsChipProps = {
  icon?: IconName;
  label?: React.ReactNode;
  selected?: boolean;
  /** Greys out icon + label (e.g. toggle off). */
  muted?: boolean;
  colorBadge?: string;
  onPress?: () => void;
  accessibilityLabel?: string;
  /** Render `label` as-is (for mixed text + icon labels). */
  unstyledLabel?: boolean;
};

export const OptionChip = React.forwardRef<
  React.ElementRef<typeof Pressable>,
  OptionsChipProps
>(function FilterChip(
  {
    label,
    onPress,
    icon,
    selected = false,
    muted = false,
    unstyledLabel = false,
    ...props
  },
  ref
) {
  const { colorScheme } = useColorScheme();
  const mutedFg = hsl("muted-foreground", colorScheme);
  const activeFg = hsl("foreground", colorScheme);
  const fg = muted ? mutedFg : selected ? activeFg : mutedFg;

  return (
    <Button
      ref={ref}
      onPress={onPress}
      className={cn(
        "min-h-7 rounded-full flex-row items-center justify-center gap-1.5 bg-card px-2.5 py-1.5",
        muted && "opacity-35"
      )}
      variant="ghost"
      size="xs"
      accessibilityRole="button"
      accessibilityState={{ selected }}
      {...props}
    >
      {icon ? (
        <View className="h-3.5 w-3.5 items-center justify-center">
          <Icon
            name={icon}
            color={
              muted
                ? "muted-foreground"
                : selected
                  ? "foreground"
                  : "muted-foreground"
            }
            size={14}
          />
        </View>
      ) : null}
      {label ? (
        unstyledLabel && React.isValidElement(label) ? (
          React.cloneElement(label as React.ReactElement<{ color?: string }>, {
            color: fg,
          })
        ) : unstyledLabel ? (
          label
        ) : (
          <Typography
            variant="span"
            style={{
              color: fg,
              fontSize: 12,
              lineHeight: 14,
              includeFontPadding: false,
            }}
          >
            {label}
          </Typography>
        )
      ) : null}
    </Button>
  );
});
