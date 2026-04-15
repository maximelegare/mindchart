import React, { useState } from "react";
import { View } from "react-native";
import { WhisperSettings } from "../whisper/whisperSettings";
import { AiProviderSettings } from "../aiProviderSettings/aiProviderSettings";
import { LlamaChatSettings } from "../llamaChat/llamaChatSettings";
import { SpaceFiller } from "@/components/ui/spaceFiller";
import { LlamaEmbeddingsSettings } from "../llamaEmbeddingsSettings/llamaEmbeddingsSettings";
import { ExpandableSetting } from "@/features/settings/components/ExpandableSetting";
import { AutoConnectSettings } from "../autoConnect/components/autoConnect";
import { useWhisper } from "@/features/whisper/hooks/useWhisperModels";
import { useLlamaChat } from "@/features/llama/hooks/useLlamaChat";
import { useLlamaEmbeddings } from "@/features/llama/hooks/useLlamaEmbeddings";
import { useAISettingsPreferences } from "@/features/settings/context/ai";

export const AISettingsFeature = () => {
  const [expandedCardId, setExpandedCardId] = useState<string | null>();

  const handleExpandableCardPress = (id: string) => {
    if (expandedCardId === id) setExpandedCardId(null);
    else setExpandedCardId(id);
  };

  const { whisper, llamaChat, llamaEmbeddings } = useAISettingsPreferences();

  const { modelFiles } = useWhisper();
  const { downloadedModels: llamaChatModelFiles } = useLlamaChat();

  const { downloadedModels: llamaEmbeddingsModelFiles } = useLlamaEmbeddings();

  return (
    <View className="flex-col gap-4">
      <AiProviderSettings />
      <AutoConnectSettings />
      <ExpandableSetting
        id="whisper"
        title="Whisper Engine"
        expanded={expandedCardId === "whisper"}
        warning={!modelFiles[whisper] ? "Setup Required" : null}
        onPress={handleExpandableCardPress}
      >
        <WhisperSettings />
      </ExpandableSetting>

      <ExpandableSetting
        id="llamaChat"
        title="Llama Chat Engine"
        warning={!llamaChatModelFiles[llamaChat] ? "Setup Required" : null}
        expanded={expandedCardId === "llamaChat"}
        onPress={handleExpandableCardPress}
      >
        <LlamaChatSettings />
      </ExpandableSetting>

      <ExpandableSetting
        id="llamaEmbeddings"
        title="Embeddings Engine"
        warning={
          !llamaEmbeddingsModelFiles[llamaEmbeddings] ? "Setup Required" : null
        }
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
