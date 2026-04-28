import { create } from "zustand";
import { AIProvider } from "../features/ai/types/ai";
import { CHAT_MODELS } from "@/features/llama/data/models/chat/chatModels";
import { EMBEDDINGS_MODELS } from "@/features/llama/data/models/embeddings/embeddingsModels";

import { persist } from "zustand/middleware";
import { mmkv } from "@/context/bridge/zustand_mmkv";

const DEFAULT_LLAMA_CHAT_MODEL = (Object.keys(CHAT_MODELS)[0] ??
  "QWEN2_5_OMNI_3B") as keyof typeof CHAT_MODELS;
const DEFAULT_LLAMA_EMBEDDINGS_MODEL = (Object.keys(EMBEDDINGS_MODELS)[0] ??
  "NOMIC_EMBED_TEXT_V1_5") as keyof typeof EMBEDDINGS_MODELS;

const ensureValidLlamaChatModel = (modelId?: string) =>
  (modelId && modelId in CHAT_MODELS
    ? modelId
    : DEFAULT_LLAMA_CHAT_MODEL) as keyof typeof CHAT_MODELS;

const ensureValidLlamaEmbeddingsModel = (modelId?: string) =>
  (modelId && modelId in EMBEDDINGS_MODELS
    ? modelId
    : DEFAULT_LLAMA_EMBEDDINGS_MODEL) as keyof typeof EMBEDDINGS_MODELS;

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

export const useAISettingsPreferences = create<UserAISettingsPreferences>()(
  persist(
    (set) => ({
      whisper: "tiny",
      llamaChat: DEFAULT_LLAMA_CHAT_MODEL,
      llamaEmbeddings: DEFAULT_LLAMA_EMBEDDINGS_MODEL,
      aiProvider: "local",
      autoConnect: true,
      setWhisperModel: (modelId: string) => set({ whisper: modelId }),
      setLlamaChatModel: (modelId: keyof typeof CHAT_MODELS) =>
        set({ llamaChat: ensureValidLlamaChatModel(modelId) }),
      setLlamaEmbeddingsModel: (modelId: keyof typeof EMBEDDINGS_MODELS) =>
        set({ llamaEmbeddings: ensureValidLlamaEmbeddingsModel(modelId) }),
      setAIProvider: (provider: AIProvider) => set({ aiProvider: provider }),
      setAutoConnect: (autoConnect: boolean) => set({ autoConnect }),
    }),
    {
      ...mmkv("settings"),
      merge: (persistedState, currentState) => {
        const persisted = (persistedState ??
          {}) as Partial<UserAISettingsPreferences>;
        return {
          ...currentState,
          ...persisted,
          llamaChat: ensureValidLlamaChatModel(persisted.llamaChat),
          llamaEmbeddings: ensureValidLlamaEmbeddingsModel(
            persisted.llamaEmbeddings
          ),
        } as UserAISettingsPreferences;
      },
    }
  )
);
