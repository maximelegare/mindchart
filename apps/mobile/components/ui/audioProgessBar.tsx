import { View } from "react-native";
import Slider from "@react-native-community/slider";
import { hsl } from "@/utils/hsl";
import { useColorScheme } from "@/lib/useColorScheme";

type AudioProgressBarProps = {
  fileURI: string | null;
  positionSeconds: number;
  durationMillis: number;
  isRecording: boolean;
  isPlaying: boolean;
  seekTo: (value: number) => void;
};

export const AudioProgressBar: React.FC<AudioProgressBarProps> = ({
  fileURI,
  positionSeconds,
  durationMillis,
  isRecording,
  seekTo,
}) => {
  const { colorScheme } = useColorScheme();

  return (
    <View
      className="w-full justify-center"
      style={{ overflow: "visible", paddingHorizontal: 10 }}
    >
      <Slider
        disabled={!fileURI}
        style={{ width: "100%", height: 40 }}
        minimumValue={0}
        maximumValue={isRecording ? 0 : durationMillis}
        value={positionSeconds}
        onSlidingComplete={seekTo}
        minimumTrackTintColor={hsl("background", colorScheme)}
        maximumTrackTintColor={hsl("popover-foreground", colorScheme)}
        thumbTintColor={hsl("background", colorScheme)}
      />
    </View>
  );
};
