import { useLlamaChat } from "@/features/llama/hooks/useLlamaChat";
import { useLlamaEmbeddings } from "@/features/llama/hooks/useLlamaEmbeddings";
import { useAISettingsPreferences } from "@/features/settings/context/ai";
import { useWhisper } from "@/features/whisper/hooks/useWhisperModels";
import { useEffect, useState } from "react";

export const useAiAutoConnect = () => {
  const { whisper, llamaChat, llamaEmbeddings, autoConnect } =
    useAISettingsPreferences();
  const { initializeModel } = useWhisper();
  const { initializeChatModel } = useLlamaChat();
  const { initializeEmbeddingModel } = useLlamaEmbeddings();

  const [isInitializing, setIsInitializing] = useState(false);

  const initializeAi = async () => {
    try {
      setIsInitializing(true);
      // Loading models in parallel is faster than sequential await
      await Promise.all([
        initializeModel(whisper),
        initializeChatModel(llamaChat),
        initializeEmbeddingModel(llamaEmbeddings),
      ]);
      console.log("AI Services initialized successfully");
    } catch (error) {
      console.error("Failed to auto-connect AI services:", error);
    } finally {
      setIsInitializing(false);
    }
  };

  useEffect(() => {
    let isMounted = true;

    if (autoConnect && isMounted) {
      initializeAi();
    }

    return () => {
      isMounted = false;
    };
  }, [autoConnect]);

  return { initializeAi, isInitializing };
};
