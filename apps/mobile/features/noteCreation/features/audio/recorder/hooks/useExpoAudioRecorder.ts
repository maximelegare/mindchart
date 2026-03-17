import { Alert } from "react-native";
import { useAudioRecorder, RecordingConfig } from "@siteed/expo-audio-studio";
import { usePermissions } from "./usePermissions";

export const useExpoAudioRecorder = () => {
  const { requestRecordingPermission } = usePermissions();

  // The studio hook provides everything we need including metering (compression/levels)
  const {
    startRecording: start,
    stopRecording: stop,
    isRecording,
    compression,
  } = useAudioRecorder();

  const startRecording = async () => {
    try {
      const recordingPermission = await requestRecordingPermission();

      if (!recordingPermission) {
        Alert.alert(
          "Permission denied",
          "Microphone access is required to record audio."
        );
        return;
      }

      const recordingConfig: RecordingConfig = {
        filename: `whisper_recording_${Date.now()}.wav`,
        sampleRate: 16000, // Ideal for Whisper
        channels: 1, // Mono
        encoding: "pcm_16bit", // CRITICAL: This creates the raw WAV format Whisper needs
        interval: 100, // How often to update metering/levels
      };

      await start(recordingConfig);
      console.log("Recording started with WAV/PCM settings");
    } catch (error) {
      console.error("Failed to start recording:", error);
    }
  };

  const stopRecording = async () => {
    try {
      if (!isRecording) return null;

      const result = await stop();

      // result.fileUri is the local path to the .wav file
      return result.fileUri;
    } catch (error) {
      console.error("Failed to stop recording:", error);
      return null;
    }
  };

  return {
    startRecording,
    stopRecording,
    isRecording,
    // 'compression.level' is equivalent to your previous 'metering'
    metering: compression?.size ?? 0,
  };
};
