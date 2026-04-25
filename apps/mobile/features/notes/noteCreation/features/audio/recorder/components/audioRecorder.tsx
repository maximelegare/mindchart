import { RecorderButton } from "./recorderButton";
// import Icon from '@/ui/Icon';

type RecorderProps = {
  onStartRecording: () => void;
  onStopRecording: () => void;
  isRecording: boolean;
  fileURI: string | null;
  disabled?: boolean;
};

export const Recorder = ({
  onStartRecording,
  onStopRecording,
  isRecording,
  fileURI,
  disabled,
}: RecorderProps) => {
  const handlePress = async () => {
    if (!isRecording) onStartRecording();
    else onStopRecording();
  };

  return (
    <RecorderButton
      disabled={disabled}
      fileURI={fileURI}
      isRecording={isRecording}
      onPress={handlePress}
    ></RecorderButton>
  );
};
