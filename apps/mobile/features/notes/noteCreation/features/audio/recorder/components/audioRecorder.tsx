import { RecorderButton } from "./recorderButton";
// import Icon from '@/ui/Icon';

type RecorderProps = {
  onStartRecording: () => Promise<void>;
  onStopRecording: () => Promise<void>;
  isRecording: boolean;
  fileURI: string | null;
  disabled?: boolean;
  isTransitioning?: boolean;
};

export const Recorder = ({
  onStartRecording,
  onStopRecording,
  isRecording,
  fileURI,
  disabled,
  isTransitioning,
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
    ></RecorderButton>
  );
};
