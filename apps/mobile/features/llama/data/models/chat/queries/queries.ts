import { CHAT_MODELS } from "../chatModels";
import { QWEN_3_PROMPT } from "./generateNote/QWEN_3";

export const QUERIES: Record<
  keyof typeof CHAT_MODELS,
  (input: string, options?: { categories?: string }) => string
> = {
  QWEN3_1_7B: QWEN_3_PROMPT,
};
