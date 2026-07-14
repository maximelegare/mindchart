import { View } from "react-native";
import { Typography } from "@/components/ui/typography";
import { hsl } from "@/utils/hsl";

export const RecordingLabel = () => {
  return (
    <View className="mb-1 flex-row items-center justify-center gap-1.5">
      <View
        style={{ backgroundColor: hsl("destructive-foreground", "light") }}
        className="h-2 w-2 rounded-full"
      />
      <Typography variant="small" className="text-destructive">
        Recording
      </Typography>
    </View>
  );
};
