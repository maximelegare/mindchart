import { useLlamaChat } from "@/features/llama/hooks/useLlamaChat";
import { useLlamaEmbeddings } from "@/features/llama/hooks/useLlamaEmbeddings";
import { useAISettingsPreferences } from "@/features/settings/context/ai";
import { useWhisper } from "@/features/whisper/hooks/useWhisperModels";
import { useEffect, useState } from "react";

export const useAiAutoConnect = () => {
  const { whisper, llamaChat, llamaEmbeddings, autoConnect } =
    useAISettingsPreferences();

  const {
    initializeModel,
    modelFiles,

    // isLoaded: whisperLoaded,
  } = useWhisper();

  const {
    initializeChatModel,
    downloadedModels: llamaChatModelFiles,
    // isLoaded: chatLoaded,
  } = useLlamaChat();

  const {
    initializeEmbeddingModel,
    downloadedModels: llamaEmbeddingsModelFiles,
    // isLoaded: embedLoaded,
  } = useLlamaEmbeddings();

  const [isInitializing, setIsInitializing] = useState(false);
  const [hasAttempted, setHasAttempted] = useState(false);
  const [setupRequired, setSetupRequired] = useState(false);

  // ✅ True only when ALL sources are loaded
  const isReady =
    modelFiles !== undefined &&
    llamaChatModelFiles !== undefined &&
    llamaEmbeddingsModelFiles !== undefined;

  const initializeAi = async () => {
    if (isInitializing) return;

    try {
      setIsInitializing(true);

      const tasks = [];

      if (autoConnect) {
        if (modelFiles[whisper]) {
          tasks.push(initializeModel(whisper));
        }

        if (llamaChatModelFiles[llamaChat]) {
          tasks.push(initializeChatModel(llamaChat));
        }

        if (llamaEmbeddingsModelFiles[llamaEmbeddings]) {
          tasks.push(initializeEmbeddingModel(llamaEmbeddings));
        }
      }

      if (tasks.length > 0) {
        await Promise.all(tasks);
        console.log("AI Services initialized successfully");
      }
    } catch (error) {
      console.error("Failed to auto-connect AI services:", error);
    } finally {
      setIsInitializing(false);
      setHasAttempted(true);
    }
  };

  useEffect(() => {
    if (!isReady) return; // 🚨 CRITICAL: prevents flicker

    const hasSelectedWhisper = !!modelFiles[whisper];
    const hasSelectedChat = !!llamaChatModelFiles[llamaChat];
    const hasSelectedEmbedding = !!llamaEmbeddingsModelFiles[llamaEmbeddings];

    const aiSetupRequired =
      !hasSelectedWhisper || !hasSelectedChat || !hasSelectedEmbedding;

    const canAttempt = autoConnect && !hasAttempted && !aiSetupRequired;

    if (aiSetupRequired) {
      setSetupRequired(true);
    } else if (canAttempt) {
      initializeAi();
    } else {
      setSetupRequired(false);
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
    isReady, // 👈 exposed to UI layer
  };
};
