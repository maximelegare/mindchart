import React from "react";
import { View } from "react-native";
import { AudioFeature } from "@/features/notes/noteCreation/features/audio/views/index";
import { useNoteCreationStore } from "@/features/notes/noteCreation/context/noteCreationContext";
import { GenerateNote } from "@/features/notes/noteCreation/features/generateNote/components/index";
import { useFileSystem } from "@/hooks/useFileSystem";

export const RecorderView = () => {
  const fileURI = useNoteCreationStore((state) => state.fileURI);
  const setFileURI = useNoteCreationStore((state) => state.setFileURI);
  const inputValue = useNoteCreationStore((state) => state.inputValue);
  const resetInputs = useNoteCreationStore((state) => state.resetInputs);
  const { deleteFile } = useFileSystem();

  const handleGenerateSuccess = () => {
    if (fileURI) {
      deleteFile(fileURI);
    }
    resetInputs();
  };

  return (
    <View className="min-h-0 w-full flex-1 flex-col px-2 pt-3">
      <View className="min-h-0 flex-1 justify-center">
        <AudioFeature onFileURIChange={setFileURI} fileURI={fileURI} />
      </View>

      <GenerateNote
        fileURI={fileURI}
        inputText={inputValue}
        currentView="audio"
        variant="centered"
        onSuccess={handleGenerateSuccess}
      />
    </View>
  );
};
