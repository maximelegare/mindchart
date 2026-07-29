import { IconName } from "@/components/ui/icons/icon-registry";
import { Pressable } from "react-native";
import React from "react";
import { useColorScheme } from "@/lib/useColorScheme";
import { hsl } from "@/utils/hsl";
import { Icon } from "@/components/ui/icons/icon";
import { Button, Typography } from "@/components/ui";

export type OptionsChipProps = {
  icon?: IconName;
  label?: string;
  selected?: boolean;
  colorBadge?: string;
  onPress?: () => void;
};

export const OptionChip = React.forwardRef<
  React.ElementRef<typeof Pressable>,
  OptionsChipProps
>(function FilterChip({ label, onPress, icon, ...props }, ref) {
  const { colorScheme } = useColorScheme();
  const mutedFg = hsl("muted-foreground", colorScheme);

  return (
    <Button
      ref={ref}
      onPress={onPress}
      className="rounded-full flex-row items-center gap-1.5 bg-card px-2"
      variant="ghost"
      size="xs"
      accessibilityRole="button"
      {...props}
    >
      {icon ? <Icon name={icon} color="muted-foreground" size={14} /> : null}
      {label ? (
        <Typography variant="p" style={{ color: mutedFg, fontSize: 12 }}>
          {label}
        </Typography>
      ) : null}
    </Button>
  );
});
