import React from "react";
import { View } from "react-native";
import { ManualModeFeature } from "@/features/notes/noteCreation/features/manualEntry/views/index";

export const ManualEntryView = () => {
  return (
    <View className="flex-1 min-h-0" style={{ paddingTop: 16 }}>
      <ManualModeFeature />
    </View>
  );
};
