import { useCallback, useEffect } from "react";
import { useAudioPlayer, useAudioPlayerStatus } from "expo-audio";

type UseExpoAudioPlayerProps = {
  uri: string | null;
};

export const useExpoAudioPlayer = ({ uri }: UseExpoAudioPlayerProps) => {
  const player = useAudioPlayer({ uri: uri ?? undefined });

  const { playing, currentTime, duration, didJustFinish } =
    useAudioPlayerStatus(player);

  // Use currentTime directly, defaulting to 0 if null
  const positionSeconds = currentTime ?? 0;

  // Match your old "reset on finish" behavior
  useEffect(() => {
    if (didJustFinish) {
      player.seekTo(0);
      player.pause();
    }
  }, [didJustFinish, player]);

  const startPlaying = useCallback(() => {
    // restart if we're at the end
    if (duration && currentTime >= duration) {
      player.seekTo(0);
    }
    player.play();
  }, [player, currentTime, duration]);

  const stopPlaying = useCallback(() => {
    player.pause();
  }, [player]);

  const seekTo = useCallback(
    (millis: number) => {
      player.seekTo(millis);
    },
    [player]
  );

  return {
    isPlaying: playing,
    positionSeconds,
    durationMillis: duration ?? 1,
    didJustFinish,
    startPlaying,
    stopPlaying,
    seekTo,
  };
};
