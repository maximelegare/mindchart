import React, { useCallback, useMemo, useState } from "react";
import { View } from "react-native";
import { WhisperSettings } from "../whisper/whisperSettings";
import { AiProvidersSettings } from "../aiProvidersSettings/aiProvidersSettings";
import { LlamaChatSettings } from "../llamaChat/llamaChatSettings";
import { SpaceFiller } from "@/components/ui/spaceFiller";
import { LlamaEmbeddingsSettings } from "../llamaEmbeddingsSettings/llamaEmbeddingsSettings";
import { ExpandableSetting } from "@/features/settings/components/expandableSetting";
import { AutoConnectSettings } from "../autoConnect/components/autoConnect";
import { useWhisper } from "@/features/whisper/hooks/useWhisperModels";
import { useLlamaChat } from "@/features/llama/hooks/useLlamaChat";
import { useLlamaEmbeddings } from "@/features/llama/hooks/useLlamaEmbeddings";
import { useAISettingsPreferences } from "@/features/settings/context/ai";
import { Theme } from "@repo/theme/global";

export const AISettingsFeature = () => {
  const [expandedCardId, setExpandedCardId] = useState<string | null>();

  const handleExpandableCardPress = useCallback((id: string) => {
    setExpandedCardId((current) => (current === id ? null : id));
  }, []);

  const { isReady: whisperReady } = useWhisper();
  const { isReady: llamaChatReady } = useLlamaChat();
  const { isReady: llamaEmbeddingsReady } = useLlamaEmbeddings();
  const { aiProviders } = useAISettingsPreferences();

  const aiProvidersLabel = useMemo(() => {
    return Object.values(aiProviders).reduce<{ text: string; color: Theme }>(
      (acc, value, idx) => {
        acc.text += `${value.charAt(0).toUpperCase()}${idx < Object.entries(aiProviders).length - 1 ? " - " : ""}`;
        return { text: acc.text, color: "foreground" };
      },
      { text: "", color: "card-foreground" }
    );
  }, [aiProviders]);

  return (
    <View className="flex-col gap-4">
      <AutoConnectSettings />
      <ExpandableSetting
        id="aiProviders"
        title="AI Providers"
        expanded={expandedCardId === "aiProviders"}
        label={aiProvidersLabel}
        onPress={handleExpandableCardPress}
      >
        <AiProvidersSettings />
      </ExpandableSetting>
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
