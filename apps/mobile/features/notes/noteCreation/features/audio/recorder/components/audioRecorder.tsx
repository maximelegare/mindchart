import { RecorderButton } from "./recorderButton";

type RecorderProps = {
  onStartRecording: () => Promise<void>;
  onStopRecording: () => Promise<void>;
  isRecording: boolean;
  fileURI: string | null;
  disabled?: boolean;
  isTransitioning?: boolean;
  size?: "default" | "compact";
};

export const Recorder = ({
  onStartRecording,
  onStopRecording,
  isRecording,
  fileURI,
  disabled,
  isTransitioning,
  size = "default",
}: RecorderProps) => {
  const handlePress = async () => {
    if (disabled || isTransitioning) return;
    if (!isRecording) await onStartRecording();
    else await onStopRecording();
  };

  return (
    <RecorderButton
      disabled={disabled || !!isTransitioning}
      fileURI={fileURI}
      isRecording={isRecording}
      onPress={handlePress}
      size={size}
    />
  );
};
