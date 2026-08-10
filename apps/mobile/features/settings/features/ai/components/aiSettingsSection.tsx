import React, { useCallback, useMemo } from "react";
import { View } from "react-native";
import ListItem from "@/components/ui/list-item";
import { Switch } from "@/components/ui/switch";
import { SettingsSection } from "@/features/settings/components/settingsSection";
import { SettingsSheetRow } from "@/features/settings/components/settingsSheetRow";
import { useAISettingsPreferences } from "@/features/settings/context/ai";
import { useWhisper } from "@/features/whisper/hooks/useWhisperModels";
import { useLlamaChat } from "@/features/llama/hooks/useLlamaChat";
import { useLlamaEmbeddings } from "@/features/llama/hooks/useLlamaEmbeddings";
import { useModal } from "@/components/ui/modal/modal";
import { WhisperSettingsContent } from "../whisper/whisperSettingsContent";
import { LlamaChatSettingsContent } from "../llamaChat/llamaChatSettingsContent";
import { LlamaEmbeddingsSettingsContent } from "../llamaEmbeddingsSettings/llamaEmbeddingsSettingsContent";
import { AiProvidersSettingsContent } from "../aiProvidersSettings/aiProvidersSettingsContent";
import { EMBEDDINGS_MODELS } from "@/features/llama/data/models/embeddings/embeddingsModels";

export function AiSettingsSection() {
  const { autoConnect, setAutoConnect, aiProviders, setAIProviders } =
    useAISettingsPreferences();
  const { openModal, closeModal } = useModal();

  const whisper = useWhisper();
  const llamaChat = useLlamaChat();
  const llamaEmbeddings = useLlamaEmbeddings();

  const providersValue = useMemo(() => {
    const values = Object.values(aiProviders);
    const allLocal = values.every((v) => v === "local");
    if (allLocal) return "Local";
    const allCloud = values.every((v) => v === "cloud");
    if (allCloud) return "Cloud";
    return "Mixed";
  }, [aiProviders]);

  const handleWhisperInitialize = useCallback(
    async (modelId: string) => {
      if (whisper.isDownloading || whisper.isInitializing) return;
      try {
        await whisper.initializeModel(modelId);
      } catch {
        openModal({
          modalName: "INITIALIZE_MODEL_ERROR",
          onConfirm: () => closeModal(),
        });
      }
    },
    [whisper, openModal, closeModal]
  );

  const handleWhisperDelete = useCallback(
    (modelId: string) => {
      openModal({
        modalName: "DELETE_MODEL_ACTION",
        onConfirm: () => {
          whisper.deleteModel(modelId);
          closeModal();
        },
        onCancel: () => closeModal(),
      });
    },
    [whisper, openModal, closeModal]
  );

  const handleChatInitialize = useCallback(
    async (modelKey: string) => {
      if (llamaChat.isDownloading || llamaChat.isInitializingChat) return;
      try {
        await llamaChat.initializeChatModel(modelKey);
      } catch {
        openModal({
          modalName: "DELETE_MODEL_ERROR",
          onConfirm: () => closeModal(),
        });
      }
    },
    [llamaChat, openModal, closeModal]
  );

  const handleChatDelete = useCallback(
    (modelKey: string) => {
      openModal({
        modalName: "DELETE_MODEL_ACTION",
        onConfirm: () => {
          llamaChat.deleteModel(modelKey);
          closeModal();
        },
        onCancel: () => closeModal(),
      });
    },
    [llamaChat, openModal, closeModal]
  );

  const handleEmbeddingsInitialize = useCallback(
    async (modelKey: keyof typeof EMBEDDINGS_MODELS) => {
      if (
        llamaEmbeddings.isDownloading ||
        llamaEmbeddings.isInitializingEmbedding
      )
        return;
      try {
        await llamaEmbeddings.initializeEmbeddingModel(modelKey);
      } catch {
        openModal({
          modalName: "DELETE_MODEL_ERROR",
          onConfirm: () => closeModal(),
        });
      }
    },
    [llamaEmbeddings, openModal, closeModal]
  );

  const handleEmbeddingsDelete = useCallback(
    (modelKey: string) => {
      openModal({
        modalName: "DELETE_MODEL_ACTION",
        onConfirm: () => {
          llamaEmbeddings.deleteModel(modelKey);
          closeModal();
        },
        onCancel: () => closeModal(),
      });
    },
    [llamaEmbeddings, openModal, closeModal]
  );

  return (
    <SettingsSection title="AI">
      <ListItem
        label="Auto Connect"
        description="Connect Whisper and Llama Chat on launch. Embeddings always connect."
        noChevron
        detail={false}
        itemRight={() => (
          <View className="ml-2">
            <Switch
              checked={autoConnect}
              onCheckedChange={setAutoConnect}
              accessibilityLabel="Auto Connect"
            />
          </View>
        )}
      />

      <SettingsSheetRow
        label="AI Providers"
        value={providersValue}
        sheetTitle="AI Providers"
      >
        <AiProvidersSettingsContent
          aiProviders={aiProviders}
          onChangeProviders={setAIProviders}
        />
      </SettingsSheetRow>

      <SettingsSheetRow
        label="Whisper Engine"
        value={whisper.isReady ? "Loaded" : "Setup"}
        sheetTitle="Whisper Engine"
      >
        <WhisperSettingsContent
          currentModelId={whisper.currentModelId}
          isDownloading={whisper.isDownloading}
          isInitializing={whisper.isInitializing}
          downloadProgress={whisper.downloadProgress}
          modelFiles={whisper.modelFiles}
          onInitialize={handleWhisperInitialize}
          onRelease={whisper.releaseAll}
          onDelete={handleWhisperDelete}
        />
      </SettingsSheetRow>

      <SettingsSheetRow
        label="Llama Chat Engine"
        value={llamaChat.isReady ? "Loaded" : "Setup"}
        sheetTitle="Llama Chat Engine"
      >
        <LlamaChatSettingsContent
          currentModelId={llamaChat.currentModelId}
          isDownloading={llamaChat.isDownloading}
          activeDownloadModelId={llamaChat.activeDownloadModelId}
          isInitializingChat={llamaChat.isInitializingChat}
          downloadProgress={llamaChat.downloadProgress}
          downloadedModels={llamaChat.downloadedModels}
          onInitialize={handleChatInitialize}
          onRelease={llamaChat.releaseChat}
          onDelete={handleChatDelete}
        />
      </SettingsSheetRow>

      <SettingsSheetRow
        label="Embeddings Engine"
        value={llamaEmbeddings.isReady ? "Loaded" : "Setup"}
        sheetTitle="Embeddings Engine"
        borderBottom={false}
      >
        <LlamaEmbeddingsSettingsContent
          currentModelId={llamaEmbeddings.currentModelId}
          isDownloading={llamaEmbeddings.isDownloading}
          activeDownloadModelId={llamaEmbeddings.activeDownloadModelId}
          isInitializingEmbedding={llamaEmbeddings.isInitializingEmbedding}
          downloadProgress={llamaEmbeddings.downloadProgress}
          downloadedModels={llamaEmbeddings.downloadedModels}
          onInitialize={handleEmbeddingsInitialize}
          onRelease={llamaEmbeddings.releaseEmbedding}
          onDelete={handleEmbeddingsDelete}
        />
      </SettingsSheetRow>
    </SettingsSection>
  );
}
