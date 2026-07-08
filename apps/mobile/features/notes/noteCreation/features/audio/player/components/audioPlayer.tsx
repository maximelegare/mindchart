// import Icon from '@/ui/Icon';
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icons/icon";
type PlayerProps = {
  fileURI: string | null;
  isPlaying: boolean;
  onPlay: () => void;
  onStop: () => void;
};

export const Player = ({ fileURI, isPlaying, onPlay, onStop }: PlayerProps) => {
  const handlePlay = () => {
    if (!isPlaying) {
      onPlay();
    } else {
      onStop();
    }
  };

  return (
    <Button
      variant="outline"
      cornerRadius="full"
      size="icon"
      onPress={handlePlay}
      disabled={!fileURI}
      className="overflow-hidden"
    >
      <Icon name="play" color="card" />
    </Button>
  );
};
