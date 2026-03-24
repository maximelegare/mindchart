import { WhisperModel } from "../types/types";

export const WHISPER_MODELS: WhisperModel[] = [
  {
    id: "tiny",
    label: "Tiny (en)",
    url: "https://huggingface.co/ggerganov/whisper.cpp/resolve/main/ggml-tiny.en.bin",
    filename: "ggml-tiny.en.bin",
    capabilities: { multilingual: false, quantizable: false },
    size: "74.1 MB",
  },
  {
    id: "base",
    label: "Base Model",
    url: "https://huggingface.co/ggerganov/whisper.cpp/resolve/main/ggml-base.bin",
    filename: "ggml-base.bin",
    capabilities: { multilingual: true, quantizable: false },
    size: "134 MB",
  },
  // ... other models from your list
];
