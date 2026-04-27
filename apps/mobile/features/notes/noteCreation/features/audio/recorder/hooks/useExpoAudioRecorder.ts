import { Alert } from "react-native";
import { useAudioRecorder, RecordingConfig } from "@siteed/expo-audio-studio";
import { usePermissions } from "./usePermissions";
import { useCallback, useRef, useState } from "react";

/**
 * Android: default `keepAwake: true` starts AudioRecordingService, but with
 * `showNotification: false` the library never calls stopService on stop — the
 * service stays alive. The next recording calls startForegroundService again;
 * only onStartCommand runs (not onCreate), so startForeground() is not invoked
 * and the OS throws ForegroundServiceDidNotStartInTimeException.
 * Foreground + notification is for background recording; in-app capture does not need it.
 */
const recordingBaseConfig = {
  keepAwake: false,
  showNotification: false,
} as const;

export const useExpoAudioRecorder = () => {
  const { requestRecordingPermission } = usePermissions();

  const {
    startRecording: start,
    stopRecording: stop,
    isRecording,
    compression,
  } = useAudioRecorder();

  const isRecordingRef = useRef(isRecording);
  isRecordingRef.current = isRecording;

  const queueRef = useRef<Promise<unknown>>(Promise.resolve());
  const [isRecorderBusy, setIsRecorderBusy] = useState(false);

  const runSerialized = useCallback(<T>(fn: () => Promise<T>): Promise<T> => {
    const next = queueRef.current.then(() => fn());
    queueRef.current = next.then(
      () => undefined,
      () => undefined
    );
    return next;
  }, []);

  const startRecording = useCallback(async () => {
    return runSerialized(async () => {
      setIsRecorderBusy(true);
      try {
        if (isRecordingRef.current) {
          return;
        }

        const recordingPermission = await requestRecordingPermission();

        if (!recordingPermission) {
          Alert.alert(
            "Permission denied",
            "Microphone access is required to record audio."
          );
          return;
        }

        if (isRecordingRef.current) {
          return;
        }

        const recordingConfig: RecordingConfig = {
          ...recordingBaseConfig,
          filename: `whisper_recording_${Date.now()}.wav`,
          sampleRate: 16000,
          channels: 1,
          encoding: "pcm_16bit",
          interval: 100,
        };

        await start(recordingConfig);
        console.log("Recording started with WAV/PCM settings");
      } catch (error) {
        console.error("Failed to start recording:", error);
      } finally {
        setIsRecorderBusy(false);
      }
    });
  }, [runSerialized, requestRecordingPermission, start]);

  const stopRecording = useCallback(async () => {
    return runSerialized(async () => {
      setIsRecorderBusy(true);
      try {
        if (!isRecordingRef.current) {
          return null;
        }

        try {
          const result = await stop();
          return result.fileUri;
        } catch (error) {
          console.error("Failed to stop recording:", error);
          return null;
        }
      } finally {
        setIsRecorderBusy(false);
      }
    });
  }, [runSerialized, stop]);

  return {
    startRecording,
    stopRecording,
    isRecording,
    isRecorderBusy,
    metering: compression?.size ?? 0,
  };
};
