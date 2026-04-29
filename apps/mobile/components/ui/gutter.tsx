import { ViewStyle } from "react-native";
import React from "react";
import { View } from "react-native";
import { cn } from "@/lib/cn";

type GutterSize = "sm" | "md" | "none";

const GUTTER_PRESETS: Record<GutterSize, ViewStyle> = {
  sm: {
    marginLeft: 4,
    marginRight: 4,
  },
  none: {
    marginLeft: 0,
    marginRight: 0,
  },
  md: {
    marginLeft: 8,
    marginRight: 8,
  },
};

export const Gutter = ({
  children,
  className,
  size = "sm",
}: {
  children: React.ReactElement | React.ReactNode;
  className?: string;
  size?: GutterSize;
}) => {
  return (
    <View style={{ ...gutter(size) }} className={cn(className)}>
      {children}
    </View>
  );
};

export const gutter = (size: GutterSize = "sm"): ViewStyle => {
  const gutter = GUTTER_PRESETS[size];
  return {
    marginLeft: gutter.marginLeft,
    marginRight: gutter.marginRight,
  };
};
