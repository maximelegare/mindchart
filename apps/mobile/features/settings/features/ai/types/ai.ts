export type AIProviders = Record<AIProviderKeys, AIProviderType>;

export type AIProviderType = "local" | "cloud";

export type AIProviderKeys = "whisper" | "llamaChat" | "embeddings";
