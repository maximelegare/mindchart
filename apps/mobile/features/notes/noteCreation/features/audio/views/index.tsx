import React from "react";
import { Recorder } from "@/features/notes/noteCreation/features/audio/recorder/components/audioRecorder";
import { Player } from "@/features/notes/noteCreation/features/audio/player/components/audioPlayer";
import { DeleteURI } from "@/features/notes/noteCreation/features/audio/deleteURI/index";
import { useExpoAudioPlayer } from "@/features/notes/noteCreation/features/audio/player/hooks/useExpoAudioPlayer";
import { useExpoAudioRecorder } from "@/features/notes/noteCreation/features/audio/recorder/hooks/useExpoAudioRecorder";
import { View } from "react-native";
import { AudioProgressBar } from "@/components/ui/audioProgessBar";
import { Timer } from "@/features/notes/noteCreation/features/audio/timer/components/timer";
import { RecordingLabel } from "@/features/notes/noteCreation/features/audio/timer/components/isRecordingLabel";
import { normalizePath } from "@/utils/path";
import { useWhisper } from "@/features/whisper/hooks/useWhisperModels";
import { RecordGenerateButton } from "@/features/notes/noteCreation/features/audio/components/recordGenerateButton";

export function AudioFeature({
  onFileURIChange,
  fileURI,
  compact = false,
  onGenerateSuccess,
}: {
  onFileURIChange: (fileURI: string | null) => void;
  fileURI: string | null;
  compact?: boolean;
  onGenerateSuccess?: () => void;
}) {
  const { currentModelId } = useWhisper();
  const { startRecording, stopRecording, isRecording, isRecorderBusy } =
    useExpoAudioRecorder();

  const handleFileURIChange = (nextFileURI: string | null) => {
    onFileURIChange(nextFileURI);
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

  if (compact) {
    return (
      <View
        className="h-full w-full flex-col justify-center gap-0"
        style={{ paddingTop: 4 }}
      >
        <View className="flex-row items-center gap-2 px-3">
          <View className="pl-1">
            <Timer
              isRecording={isRecording}
              positionSeconds={positionSeconds}
              variant="h4"
              className="min-w-[56px]"
            />
          </View>
          <View className="min-w-0 flex-1">
            <AudioProgressBar
              isPlaying={isPlaying}
              isRecording={isRecording}
              durationMillis={durationMillis}
              positionSeconds={positionSeconds}
              seekTo={seekTo}
              fileURI={fileURI}
              padded={false}
            />
          </View>
          <View className="flex-row items-center gap-2">
            <Player
              fileURI={fileURI}
              onPlay={startPlaying}
              onStop={stopPlaying}
              isPlaying={isPlaying}
            />
            <DeleteURI
              fileURI={fileURI}
              onDelete={() => onFileURIChange(null)}
            />
          </View>
        </View>

        <View className="items-center justify-center">
          <RecordGenerateButton
            disabled={!currentModelId}
            fileURI={fileURI}
            isRecording={isRecording}
            isTransitioning={isRecorderBusy}
            onStartRecording={startRecording}
            onStopRecording={async () => {
              const uri = await stopRecording();
              handleFileURIChange(normalizePath(uri));
            }}
            onGenerateSuccess={onGenerateSuccess}
          />
        </View>
      </View>
    );
  }

  return (
    <View
      className="flex h-full w-full flex-col items-center justify-center"
      style={{ gap: 30 }}
    >
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
