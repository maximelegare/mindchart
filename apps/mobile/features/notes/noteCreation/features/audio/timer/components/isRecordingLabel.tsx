import { View } from "react-native";
import { Typography } from "@/components/ui/typography";
import { cn } from "@/lib/cn";
import { hsl } from "@/utils/hsl";

export const RecordingLabel = () => {
  return (
    <View
      className={cn("flex-row items-center gap-1 animate-pulse absolute")}
      style={{ top: -5 }}
    >
      <View
        style={{ backgroundColor: hsl("destructive-foreground", "light") }}
        className={cn("w-3 h-3 rounded-full")}
      ></View>
      <Typography variant="h4">Recording...</Typography>
    </View>
  );
};
