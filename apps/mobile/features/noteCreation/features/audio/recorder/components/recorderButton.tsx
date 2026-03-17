import * as React from "react";
import { TouchableOpacity } from "react-native";
import { cn } from "@/lib/cn";
import { Icon } from "@/components/ui/icons/icon";
import { Gradient } from "@/components/ui/gradient";
import { useColorScheme } from "@/lib/useColorScheme";

type ButtonProps = React.ComponentPropsWithoutRef<typeof TouchableOpacity> & {
  fileURI: string | null;
  isRecording: boolean;
};

// 1. Define your "Base" styles separately for clarity
const BASE_STYLES =
  "group flex items-center justify-center rounded-full bg-primary web:transition-all";

export const RecorderButton = React.forwardRef<
  React.ElementRef<typeof TouchableOpacity>,
  ButtonProps
>(({ className, isRecording, fileURI, ...props }, ref) => {
  const { colorScheme } = useColorScheme();
  return (
    <TouchableOpacity
      ref={ref}
      role="button"
      // Ensure hitSlop is added to make the touch area generous
      hitSlop={20}
      // Pass all props (including onPress) explicitly
      {...props}
      style={[{ width: 100, height: 100 }, props.style as any]}
      className={cn(
        BASE_STYLES,
        props.disabled && "opacity-50",
        "overflow-hidden",
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
        size={40}
        // This ensures the icon doesn't steal the touch event
      />
    </TouchableOpacity>
  );
});
