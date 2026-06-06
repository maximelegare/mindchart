import { hsl } from "@/utils/hsl";
import { Theme } from "@repo/theme/global";
import React from "react";
import { ActivityIndicator, View } from "react-native";
import { Typography } from "@/components/ui/typography";

type LoadingStateProps = {
  color?: Theme;
  size?: "small" | "large";
  title?: string;
  description?: string;
};

export const LoadingState = ({
  color = "primary",
  size = "small",
  title,
  description,
}: LoadingStateProps) => {
  return (
    <View className="flex-col items-center gap-3 justify-center py-8 min-h-[120px]">
      {title ? <Typography variant="h3">{title}</Typography> : null}
      <ActivityIndicator size={size} color={hsl(color, "light")} />
      {description ? (
        <Typography variant="muted" className="text-center px-4">
          {description}
        </Typography>
      ) : null}
    </View>
  );
};
