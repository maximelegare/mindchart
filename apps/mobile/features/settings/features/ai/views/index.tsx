import React, { useState } from "react";
import { View } from "react-native";
import { WhisperSettings } from "../whisper/whisperSettings";
import { AiProviderSettings } from "../aiProviderSettings/aiProviderSettings";
import { LlamaChatSettings } from "../llamaChat/llamaChatSettings";
import { SpaceFiller } from "@/components/ui/spaceFiller";
import { LlamaEmbeddingsSettings } from "../llamaEmbeddingsSettings/llamaEmbeddingsSettings";
import { ExpandableSetting } from "@/features/settings/components/ExpandableSetting";
import { AutoConnectSettings } from "../autoConnect/autoConnect";

export const AISettingsFeature = () => {
  const [expandedCardId, setExpandedCardId] = useState<string | null>();

  const handleExpandableCardPress = (id: string) => {
    if (expandedCardId === id) setExpandedCardId(null);
    else setExpandedCardId(id);
  };

  return (
    <View className="flex-col gap-4">
      <AiProviderSettings />
      <AutoConnectSettings />
      <ExpandableSetting
        id="whisper"
        title="Whisper Engine"
        expanded={expandedCardId === "whisper"}
        onPress={handleExpandableCardPress}
      >
        <WhisperSettings />
      </ExpandableSetting>

      <ExpandableSetting
        id="llamaChat"
        title="Llama Chat Engine"
        expanded={expandedCardId === "llamaChat"}
        onPress={handleExpandableCardPress}
      >
        <LlamaChatSettings />
      </ExpandableSetting>

      <ExpandableSetting
        id="llamaEmbeddings"
        title="Embeddings Engine"
        expanded={expandedCardId === "llamaEmbeddings"}
        onPress={handleExpandableCardPress}
      >
        <LlamaEmbeddingsSettings />
      </ExpandableSetting>
      <SpaceFiller
        sizes={{ marginBottom: ["TAB_BAR_HEIGHT", "HEADER_OVERLAP"] }}
      />
    </View>
  );
};
