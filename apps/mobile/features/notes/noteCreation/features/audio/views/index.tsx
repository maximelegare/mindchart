import React from "react";
import { Recorder } from "@/features/notes/noteCreation/features/audio/recorder/components/audioRecorder";
import { Player } from "@/features/notes/noteCreation/features/audio/player/components/audioPlayer";
import { DeleteURI } from "@/features/notes/noteCreation/features/audio/deleteURI/index";
import { useExpoAudioPlayer } from "@/features/notes/noteCreation/features/audio/player/hooks/useExpoAudioPlayer";
import { useExpoAudioRecorder } from "@/features/notes/noteCreation/features/audio/recorder/hooks/useExpoAudioRecorder";
import { View } from "react-native";
import { AudioProgressBar } from "@/components/ui/audioProgessBar";
// import { TimeLine } from "@/features/notes/noteCreation/features/audio/timeLine/components/timeLine";
import { Timer } from "@/features/notes/noteCreation/features/audio/timer/components/timer";
import { RecordingLabel } from "@/features/notes/noteCreation/features/audio/timer/components/isRecordingLabel";
import { normalizePath } from "@/utils/path";
import { useWhisper } from "@/features/whisper/hooks/useWhisperModels";

export function AudioFeature({
  onFileURIChange,
  fileURI,
}: {
  onFileURIChange: (fileURI: string | null) => void;
  fileURI: string | null;
}) {
  const { currentModelId } = useWhisper();
  const {
    startRecording,
    stopRecording,
    isRecording,
    isRecorderBusy,
    // metering,
  } = useExpoAudioRecorder();

  const handleFileURIChange = (fileURI: string | null) => {
    onFileURIChange(fileURI);
  };

  const {
    isPlaying,
    startPlaying,
    stopPlaying,
    durationMillis,
    positionSeconds,
    seekTo,
  } = useExpoAudioPlayer({
    uri: fileURI,
  });
  return (
    <View
      className="flex h-full w-full flex-col items-center justify-center"
      style={{ gap: 30 }}
    >
      {/* <TimeLine metering={metering} isRecording={isRecording} /> */}
      <View className="items-center justify-center">
        {isRecording && <RecordingLabel />}
        <Timer isRecording={isRecording} positionSeconds={positionSeconds} />
      </View>
      <AudioProgressBar
        isPlaying={isPlaying}
        isRecording={isRecording}
        durationMillis={durationMillis}
        positionSeconds={positionSeconds}
        seekTo={seekTo}
        fileURI={fileURI}
      />
      <View className="flex-row items-center justify-center gap-4">
        <Player
          fileURI={fileURI}
          onPlay={startPlaying}
          onStop={stopPlaying}
          isPlaying={isPlaying}
        />
        <Recorder
          disabled={!currentModelId}
          fileURI={fileURI}
          onStartRecording={startRecording}
          onStopRecording={async () => {
            const uri = await stopRecording();
            handleFileURIChange(normalizePath(uri));
          }}
          isRecording={isRecording}
          isTransitioning={isRecorderBusy}
        />
        <DeleteURI fileURI={fileURI} onDelete={() => onFileURIChange(null)} />
      </View>
    </View>
  );
}
