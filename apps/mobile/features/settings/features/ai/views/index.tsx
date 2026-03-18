import React from "react";
import { View } from "react-native";
import { WhisperSettings } from "../whisper/whisperSettings";
import { AiProviderSettings } from "../aiProviderSettings/aiProviderSettings";
import { LlamaChatSettings } from "../llamaChat/llamaChatSettings";
import { SpaceFiller } from "@/components/ui/spaceFiller";
import { LlamaEmbeddingsSettings } from "../llamaEmbeddingsSettings/llamaEmbeddingsSettings";

export const AISettingsFeature = () => {
  return (
    <View className="flex-col gap-4">
      <AiProviderSettings />
      <WhisperSettings />
      <LlamaChatSettings />
      <LlamaEmbeddingsSettings />
      <SpaceFiller
        sizes={{ marginBottom: ["TAB_BAR_HEIGHT", "HEADER_OVERLAP"] }}
      />
    </View>
  );
};
