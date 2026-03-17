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
    <View className="w-full flex-col items-center gap-4">
      <View className="w-full flex-row justify-between items-center">
        <Slider
          disabled={!fileURI}
          style={{ width: "auto", flex: 1 }}
          minimumValue={0}
          maximumValue={isRecording ? 0 : durationMillis}
          value={positionSeconds}
          onSlidingComplete={seekTo}
          minimumTrackTintColor={hsl("primary", colorScheme)}
          maximumTrackTintColor={hsl("primary", colorScheme)}
          thumbTintColor={hsl("primary", colorScheme)}
        />
        {/* <Timer isRecording={isRecording} positionSeconds={positionSeconds} /> */}
      </View>
    </View>
  );
};
