import { useLlamaChat } from "@/features/llama/hooks/useLlamaChat";
import { useLlamaEmbeddings } from "@/features/llama/hooks/useLlamaEmbeddings";
import { useAISettingsPreferences } from "@/features/settings/context/ai";
import { useWhisper } from "@/features/whisper/hooks/useWhisperModels";
import { useEffect, useState } from "react";

export const useAiAutoConnect = () => {
  const { whisper, llamaChat, llamaEmbeddings, autoConnect } =
    useAISettingsPreferences();

  const { initializeModel, modelFiles, hasCheckedDownloadedModels } =
    useWhisper();

  const {
    initializeChatModel,
    downloadedModels: llamaChatModelFiles,
    hasCheckedLocalModels: hasCheckedLlamaChatModels,
  } = useLlamaChat();

  const {
    initializeEmbeddingModel,
    downloadedModels: llamaEmbeddingsModelFiles,
    hasCheckedLocalModels: hasCheckedLlamaEmbeddingsModels,
  } = useLlamaEmbeddings();

  const [isInitializing, setIsInitializing] = useState(false);
  const [hasAttempted, setHasAttempted] = useState(false);
  const [setupRequired, setSetupRequired] = useState(false);

  // Wait until disk scans finish — empty {} is not "ready"
  const isReady =
    !!hasCheckedDownloadedModels &&
    !!hasCheckedLlamaChatModels &&
    !!hasCheckedLlamaEmbeddingsModels;

  const initializeAi = async () => {
    if (isInitializing) return;

    const tasks = [];

    // Embeddings always auto-connect when downloaded
    if (llamaEmbeddingsModelFiles[llamaEmbeddings]) {
      tasks.push(initializeEmbeddingModel(llamaEmbeddings));
    }

    // Whisper and Llama Chat only when Auto Connect is enabled
    if (autoConnect) {
      if (modelFiles[whisper]) {
        tasks.push(initializeModel(whisper));
      }

      if (llamaChatModelFiles[llamaChat]) {
        tasks.push(initializeChatModel(llamaChat));
      }
    }

    if (tasks.length === 0) {
      setHasAttempted(true);
      return;
    }

    try {
      setIsInitializing(true);
      await Promise.all(tasks);
      console.log("AI Services initialized successfully");
    } catch (error) {
      console.error("Failed to auto-connect AI services:", error);
    } finally {
      setIsInitializing(false);
      setHasAttempted(true);
    }
  };

  useEffect(() => {
    if (!isReady) return;

    const hasSelectedEmbedding = !!llamaEmbeddingsModelFiles[llamaEmbeddings];

    // Setup modal is embeddings-only; missing whisper/llama should not trigger it
    setSetupRequired(!hasSelectedEmbedding);

    if (!hasAttempted) {
      initializeAi();
    }
  }, [
    autoConnect,
    modelFiles,
    llamaChatModelFiles,
    llamaEmbeddingsModelFiles,
    hasAttempted,
    isReady,
  ]);

  return {
    initializeAi,
    isInitializing,
    setupRequired,
    isReady,
  };
};
