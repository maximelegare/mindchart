import * as React from "react";
import { TouchableOpacity } from "react-native";
import { cn } from "@/lib/cn";
import { Icon } from "@/components/ui/icons/icon";
import { Gradient } from "@/components/ui/gradient";
import { useColorScheme } from "@/lib/useColorScheme";

type ButtonProps = React.ComponentPropsWithoutRef<typeof TouchableOpacity> & {
  fileURI: string | null;
  isRecording: boolean;
  size?: "default" | "compact";
};

const BASE_STYLES =
  "group flex items-center justify-center rounded-full bg-primary web:transition-all";

const SIZE_STYLES = {
  default: { box: 100, icon: 40 },
  compact: { box: 52, icon: 28 },
} as const;

export const RecorderButton = React.forwardRef<
  React.ElementRef<typeof TouchableOpacity>,
  ButtonProps
>(({ className, isRecording, fileURI, size = "default", ...props }, ref) => {
  const { colorScheme } = useColorScheme();
  const dimensions = SIZE_STYLES[size];

  return (
    <TouchableOpacity
      ref={ref}
      role="button"
      hitSlop={size === "compact" ? 8 : 20}
      {...props}
      style={[
        { width: dimensions.box, height: dimensions.box },
        props.style as object,
      ]}
      className={cn(
        BASE_STYLES,
        props.disabled && "opacity-50",
        "overflow-hidden border-2 border-border",
        className
      )}
    >
      <Gradient
        theme={colorScheme}
        variant={!isRecording ? "primary" : "destructive"}
        className="absolute"
      />
      <Icon
        name={!isRecording ? (!fileURI ? "mic" : "rotate-cw") : "square"}
        color="background"
        size={dimensions.icon}
      />
    </TouchableOpacity>
  );
});
