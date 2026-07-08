import { Gutter } from "@/components/ui/gutter";
import React from "react";
import { View } from "react-native";
import ViewSwitcher from "@/components/ui/viewSwitcher";
import { TextInputFeature } from "@/features/notes/noteCreation/features/textInput/textInput";
import { ManualModeFeature } from "@/features/notes/noteCreation/features/manualEntry/views/index";
import { useNoteCreationStore } from "../context/noteCreationContext";

export function NoteCreationFeature() {
  const creationMode = useNoteCreationStore((state) => state.creationMode);
  const inputView = useNoteCreationStore((state) => state.inputView);
  const inputValue = useNoteCreationStore((state) => state.inputValue);
  const setInputValue = useNoteCreationStore((state) => state.setInputValue);

  return (
    <Gutter className="flex-1 min-h-0">
      {creationMode === "ai" ? (
        <View style={{ height: 550 }} className="overflow-hidden flex-col">
          <ViewSwitcher
            currentMode={inputView}
            firstMode="audio"
            firstComponent={<View className="flex-1" />}
            secondComponent={
              <TextInputFeature onChange={setInputValue} value={inputValue} />
            }
          />
        </View>
      ) : (
        <View className="flex-1 min-h-0 overflow-hidden">
          <ManualModeFeature />
        </View>
      )}
    </Gutter>
  );
}
