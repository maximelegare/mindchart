import React, { useCallback, useState } from "react";
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

export const AISettingsFeature = () => {
  const [expandedCardId, setExpandedCardId] = useState<string | null>();

  const handleExpandableCardPress = useCallback((id: string) => {
    setExpandedCardId((current) => (current === id ? null : id));
  }, []);

  const { isReady: whisperReady } = useWhisper();
  const { isReady: llamaChatReady } = useLlamaChat();

  const { isReady: llamaEmbeddingsReady } = useLlamaEmbeddings();

  return (
    <View className="flex-col gap-4">
      <AiProviderSettings />
      <AutoConnectSettings />
      <ExpandableSetting
        id="whisper"
        title="Whisper Engine"
        expanded={expandedCardId === "whisper"}
        label={
          !whisperReady
            ? { text: "Setup Required", color: "destructive-foreground" }
            : { text: "Loaded", color: "primary" }
        }
        onPress={handleExpandableCardPress}
      >
        <WhisperSettings />
      </ExpandableSetting>

      <ExpandableSetting
        id="llamaChat"
        title="Llama Chat Engine"
        label={
          !llamaChatReady
            ? { text: "Setup Required", color: "destructive-foreground" }
            : { text: "Loaded", color: "primary" }
        }
        expanded={expandedCardId === "llamaChat"}
        onPress={handleExpandableCardPress}
      >
        <LlamaChatSettings />
      </ExpandableSetting>

      <ExpandableSetting
        id="llamaEmbeddings"
        title="Embeddings Engine"
        label={
          !llamaEmbeddingsReady
            ? { text: "Setup Required", color: "destructive-foreground" }
            : { text: "Loaded", color: "primary" }
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
