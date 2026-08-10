import * as React from "react";
import * as SeparatorPrimitive from "@/components/primitives/separator";
import { cn } from "@/lib/cn";
import { Theme } from "@repo/theme/global";
import { useColorScheme } from "@/lib/useColorScheme";
import { hsl } from "@/utils/hsl";

const Separator = React.forwardRef<
  React.ElementRef<typeof SeparatorPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SeparatorPrimitive.Root> & {
    color?: Theme;
  }
>(
  (
    {
      className,
      color = "border",
      orientation = "horizontal",
      decorative = true,
      ...props
    },
    ref
  ) => {
    const { colorScheme } = useColorScheme();
    const resolved = hsl(color, colorScheme);

    return (
      <SeparatorPrimitive.Root
        ref={ref}
        decorative={decorative}
        orientation={orientation}
        style={{
          backgroundColor: resolved,
          borderColor: resolved,
        }}
        className={cn(
          "shrink-0",
          orientation === "horizontal" ? "h-[1px] w-full" : "h-full w-[1px]",
          className
        )}
        {...props}
      />
    );
  }
);
Separator.displayName = SeparatorPrimitive.Root.displayName;

export { Separator };
