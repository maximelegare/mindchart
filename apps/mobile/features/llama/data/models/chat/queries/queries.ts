import { CHAT_MODELS } from "../chatModels";
import { SMOL_LM_3_PROMPT } from "./generateNote/SMOL_LM_3";

export const QUERIES: Record<
  keyof typeof CHAT_MODELS,
  (input: string, options: { categories: string }) => string
> = {
  INTERNVL3_2B: SMOL_LM_3_PROMPT,
}; // SMOL_VLM_2_2B: {
//   name: 'SmolVLM2 2.2B Instruct (Q4_K_M)',
//   repo: 'ggml-org/SmolVLM2-2.2B-Instruct-GGUF',
//   filename: 'SmolVLM2-2.2B-Instruct-Q4_K_M.gguf',
//   mmproj: 'mmproj-SmolVLM2-2.2B-Instruct-Q8_0.gguf',
//   size: '1.8GB (model) + 565MB (mmproj)',
// },
