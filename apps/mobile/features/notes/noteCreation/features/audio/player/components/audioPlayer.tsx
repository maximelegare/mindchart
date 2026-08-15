import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icons/icon";

type PlayerProps = {
  fileURI: string | null;
  isPlaying: boolean;
  onPlay: () => void;
  onStop: () => void;
};

export const Player = ({ fileURI, isPlaying, onPlay, onStop }: PlayerProps) => {
  const disabled = !fileURI;
  const handlePlay = () => {
    if (!isPlaying) {
      onPlay();
    } else {
      onStop();
    }
  };

  return (
    <Button
      variant={disabled ? "outline" : "default"}
      cornerRadius="full"
      size="icon"
      onPress={handlePlay}
      disabled={disabled}
      accessibilityLabel={isPlaying ? "Stop playback" : "Play recording"}
      className="overflow-hidden"
    >
      <Icon
        name={isPlaying ? "square" : "play"}
        color={disabled ? "muted-foreground" : "primary-foreground"}
        size={18}
      />
    </Button>
  );
};
