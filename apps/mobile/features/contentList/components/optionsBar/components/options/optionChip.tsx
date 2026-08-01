import { IconName } from "@/components/ui/icons/icon-registry";
import { Pressable } from "react-native";
import React from "react";
import { useColorScheme } from "@/lib/useColorScheme";
import { hsl } from "@/utils/hsl";
import { Icon } from "@/components/ui/icons/icon";
import { Button, Typography } from "@/components/ui";
import { cn } from "@/lib/cn";

export type OptionsChipProps = {
  icon?: IconName;
  label?: string;
  selected?: boolean;
  /** Greys out icon + label (e.g. toggle off). */
  muted?: boolean;
  colorBadge?: string;
  onPress?: () => void;
  accessibilityLabel?: string;
};

export const OptionChip = React.forwardRef<
  React.ElementRef<typeof Pressable>,
  OptionsChipProps
>(function FilterChip(
  { label, onPress, icon, selected = false, muted = false, ...props },
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
        "rounded-full flex-row items-center gap-1.5 bg-card px-2",
        muted && "opacity-35"
      )}
      variant="ghost"
      size="xs"
      accessibilityRole="button"
      accessibilityState={{ selected }}
      {...props}
    >
      {icon ? (
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
      ) : null}
      {label ? (
        <Typography variant="p" style={{ color: fg, fontSize: 12 }}>
          {label}
        </Typography>
      ) : null}
    </Button>
  );
});
