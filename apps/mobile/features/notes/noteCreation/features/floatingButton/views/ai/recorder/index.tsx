import React from "react";
import { View } from "react-native";
import { AudioFeature } from "@/features/notes/noteCreation/features/audio/views/index";
import { useNoteCreationStore } from "@/features/notes/noteCreation/context/noteCreationContext";

export const RecorderView = () => {
  const fileURI = useNoteCreationStore((state) => state.fileURI);
  const setFileURI = useNoteCreationStore((state) => state.setFileURI);

  return (
    <View className="flex-1 justify-center px-2 pt-3">
      <AudioFeature onFileURIChange={setFileURI} fileURI={fileURI} />
    </View>
  );
};
