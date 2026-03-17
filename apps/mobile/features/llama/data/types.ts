import { EMBEDDINGS_MODELS } from "./models/embeddings/embeddingsModels";
import { CHAT_MODELS } from "./models/chat/chatModels";

export type ModelId = keyof typeof EMBEDDINGS_MODELS | keyof typeof CHAT_MODELS;
