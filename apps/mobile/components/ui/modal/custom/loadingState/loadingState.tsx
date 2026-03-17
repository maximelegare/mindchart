import { hsl } from "@/utils/hsl";
import { Theme } from "@repo/theme/global";
import React from "react";
import { ActivityIndicator, View } from "react-native";
import { Typography } from "@/components/ui/typography";

type LoadingStateProps = {
  color?: Theme;
  size?: "small" | "large";
  title?: string;
};

export const LoadingState = ({
  color = "primary",
  size = "small",
  title,
}: LoadingStateProps) => {
  return (
    <View className="flex-col items-center gap-3 justify-center h-20">
      {title && <Typography variant="h3">{title}</Typography>}
      <ActivityIndicator size={size} color={hsl(color, "light")} />
    </View>
  );
};
