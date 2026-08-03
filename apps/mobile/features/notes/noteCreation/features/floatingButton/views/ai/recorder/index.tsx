import React from "react";
import { View } from "react-native";
import { AudioFeature } from "@/features/notes/noteCreation/features/audio/views/index";
import { useNoteCreationStore } from "@/features/notes/noteCreation/context/noteCreationContext";
import { useFileSystem } from "@/hooks/useFileSystem";
import { useWhisper } from "@/features/whisper/hooks/useWhisperModels";
import { useLlamaChat } from "@/features/llama/hooks/useLlamaChat";
import { AiModelRequired } from "@/features/notes/noteCreation/features/floatingButton/components/aiModelRequired";

const recorderRequiredMessage = (
  whisperReady: boolean,
  llamaReady: boolean
) => {
  if (!whisperReady && !llamaReady) {
    return "Initialize Whisper and Llama Chat in Settings to use the recorder.";
  }
  if (!whisperReady) {
    return "Initialize Whisper in Settings to use the recorder.";
  }
  return "Initialize Llama Chat in Settings to use the recorder.";
};

export const RecorderView = () => {
  const fileURI = useNoteCreationStore((state) => state.fileURI);
  const setFileURI = useNoteCreationStore((state) => state.setFileURI);
  const resetInputs = useNoteCreationStore((state) => state.resetInputs);
  const { deleteFile } = useFileSystem();
  const { isReady: isWhisperReady } = useWhisper();
  const { isReady: isLlamaReady } = useLlamaChat();

  const handleGenerateSuccess = () => {
    if (fileURI) {
      deleteFile(fileURI);
    }
    resetInputs();
  };

  if (!isWhisperReady || !isLlamaReady) {
    return (
      <AiModelRequired
        message={recorderRequiredMessage(isWhisperReady, isLlamaReady)}
      />
    );
  }

  return (
    <View className="min-h-0 w-full flex-1 p-2">
      <AudioFeature
        onFileURIChange={setFileURI}
        fileURI={fileURI}
        compact
        onGenerateSuccess={handleGenerateSuccess}
      />
    </View>
  );
};
