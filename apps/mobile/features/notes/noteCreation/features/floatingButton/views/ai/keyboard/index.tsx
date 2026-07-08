import React from "react";
import { View } from "react-native";
import { TextInputFeature } from "@/features/notes/noteCreation/features/textInput/textInput";
import { useNoteCreationStore } from "@/features/notes/noteCreation/context/noteCreationContext";

export const KeyboardView = () => {
  const inputValue = useNoteCreationStore((state) => state.inputValue);
  const setInputValue = useNoteCreationStore((state) => state.setInputValue);

  return (
    <View className="flex-1 px-4 " style={{ paddingTop: 16 }}>
      <TextInputFeature onChange={setInputValue} value={inputValue} />
    </View>
  );
};
