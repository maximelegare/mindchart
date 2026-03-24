import { useLlamaChat } from "@/features/llama/hooks/useLlamaChat";
import { useLlamaEmbeddings } from "@/features/llama/hooks/useLlamaEmbeddings";
import { useAISettingsPreferences } from "@/features/settings/context/ai";
import { useWhisper } from "@/features/whisper/hooks/useWhisperModels";
import { useEffect, useState } from "react";

export const useAiAutoConnect = () => {
  const { whisper, llamaChat, llamaEmbeddings, autoConnect } =
    useAISettingsPreferences();
  const { initializeModel, modelFiles } = useWhisper();
  const { initializeChatModel, downloadedModels: llamaChatModelFiles } =
    useLlamaChat();
  const {
    initializeEmbeddingModel,
    downloadedModels: llamaEmbeddingsModelFiles,
  } = useLlamaEmbeddings();

  const [isInitializing, setIsInitializing] = useState(false);
  const [hasAttempted, setHasAttempted] = useState(false);

  const initializeAi = async () => {
    // Prevent double-initialization if already running
    if (isInitializing) return;

    try {
      setIsInitializing(true);

      const tasks = [];

      if (autoConnect) {
        if (modelFiles[whisper]) tasks.push(initializeModel(whisper));
        if (llamaChatModelFiles[llamaChat])
          tasks.push(initializeChatModel(llamaChat));
        if (llamaEmbeddingsModelFiles[llamaEmbeddings])
          tasks.push(initializeEmbeddingModel(llamaEmbeddings));
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
    const canAttempt =
      autoConnect &&
      !hasAttempted &&
      Object.keys(modelFiles).length > 0 &&
      Object.keys(llamaChatModelFiles).length > 0 &&
      Object.keys(llamaEmbeddingsModelFiles).length > 0;

    if (canAttempt) {
      initializeAi();
    }
  }, [
    autoConnect,
    modelFiles,
    llamaChatModelFiles,
    llamaEmbeddingsModelFiles,
    hasAttempted,
  ]);

  return { initializeAi, isInitializing };
};
