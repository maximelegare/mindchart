import { Gutter } from "@/components/ui/gutter";
import React from "react";
import { View } from "react-native";
import { ManualModeFeature } from "@/features/notes/noteCreation/features/manualEntry/views/index";
import { useNoteCreationStore } from "../context/noteCreationContext";

export function NoteCreationFeature() {
  const creationMode = useNoteCreationStore((state) => state.creationMode);

  return (
    <Gutter className="flex-1 min-h-0">
      {creationMode === "ai" ? (
        <View className="flex-1" />
      ) : (
        <View className="flex-1 min-h-0 overflow-hidden">
          <ManualModeFeature />
        </View>
      )}
    </Gutter>
  );
}
