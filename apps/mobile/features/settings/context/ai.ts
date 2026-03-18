import { create } from "zustand";
import { AIProvider } from "../features/ai/types/ai";
import { CHAT_MODELS } from "@/features/llama/data/models/chat/chatModels";
import { EMBEDDINGS_MODELS } from "@/features/llama/data/models/embeddings/embeddingsModels";

export type UserAISettingsPreferences = {
  whisper: string;
  llamaChat: keyof typeof CHAT_MODELS;
  llamaEmbeddings: keyof typeof EMBEDDINGS_MODELS;
  aiProvider: AIProvider;
  autoConnect: boolean;
  setWhisperModel: (modelId: string) => void;
  setLlamaChatModel: (modelId: keyof typeof CHAT_MODELS) => void;
  setLlamaEmbeddingsModel: (modelId: keyof typeof EMBEDDINGS_MODELS) => void;
  setAIProvider: (provider: AIProvider) => void;
  setAutoConnect: (autoConnect: boolean) => void;
};

export const useAISettingsPreferences = create<UserAISettingsPreferences>(
  (set) => ({
    whisper: "tiny",
    llamaChat: "INTERNVL3_2B",
    llamaEmbeddings: "NOMIC_EMBED_TEXT_V1_5",
    aiProvider: "local",
    autoConnect: true,
    setWhisperModel: (modelId: string) => set({ whisper: modelId }),
    setLlamaChatModel: (modelId: keyof typeof CHAT_MODELS) =>
      set({ llamaChat: modelId }),
    setLlamaEmbeddingsModel: (modelId: keyof typeof EMBEDDINGS_MODELS) =>
      set({ llamaEmbeddings: modelId }),
    setAIProvider: (provider: AIProvider) => set({ aiProvider: provider }),
    setAutoConnect: (autoConnect: boolean) => set({ autoConnect }),
  })
);
