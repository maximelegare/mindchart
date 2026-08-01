import React from "react";
import { View } from "react-native";
import { AudioFeature } from "@/features/notes/noteCreation/features/audio/views/index";
import { useNoteCreationStore } from "@/features/notes/noteCreation/context/noteCreationContext";
import { useFileSystem } from "@/hooks/useFileSystem";

export const RecorderView = () => {
  const fileURI = useNoteCreationStore((state) => state.fileURI);
  const setFileURI = useNoteCreationStore((state) => state.setFileURI);
  const resetInputs = useNoteCreationStore((state) => state.resetInputs);
  const { deleteFile } = useFileSystem();

  const handleGenerateSuccess = () => {
    if (fileURI) {
      deleteFile(fileURI);
    }
    resetInputs();
  };

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
