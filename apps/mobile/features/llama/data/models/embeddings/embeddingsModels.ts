export const EMBEDDINGS_MODELS = {
  NOMIC_EMBED_TEXT_V1_5: {
    name: "Nomic Embed Text v1.5 (Q8_0)",
    repo: "nomic-ai/nomic-embed-text-v1.5-GGUF",
    filename: "nomic-embed-text-v1.5.Q8_0.gguf",
    mmproj: undefined,
    embedding: true,
    size: "146MB",
  },
  SNOWFLAKE_ARCTIC_EMBED_M_V1_5: {
    name: "Snowflake Arctic Embed M v1.5 (Q8_0)",
    repo: "Snowflake/snowflake-arctic-embed-m-v1.5",
    filename: "gguf/snowflake-arctic-embed-m-v1.5-q8_0.gguf",
    mmproj: undefined,
    embedding: true,
    size: "118MB",
  },
  EMBEDDINGGEMMA_300M: {
    name: "EmbeddingGemma 300M (Q8_0)",
    repo: "ggml-org/embeddinggemma-300M-GGUF",
    filename: "embeddinggemma-300M-Q8_0.gguf",
    mmproj: undefined,
    embedding: true,
    size: "329MB",
  },
};
