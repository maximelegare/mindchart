import { useCallback } from "react";
import {
  GenerateLocalNoteResult,
  useLlamaService,
} from "@/features/llama/services/llamaService";
import { AIProvider } from "@repo/constants";

export type GenerateContentServiceInput = {
  transcript: string;
  provider: AIProvider;
};

export const useGenerateContentService = () => {
  const { generateLocalNote } = useLlamaService();

  const generateContentService = useCallback(
    async ({
      transcript,
      provider,
    }: GenerateContentServiceInput): Promise<GenerateLocalNoteResult> => {
      if (!transcript.trim()) {
        throw new Error("Transcript is required");
      }

      if (provider === "local") {
        return generateLocalNote(transcript);
      }
      if (provider === "cloud") {
        throw new Error("Cloud content generation is not implemented yet");
      }
      throw new Error(`Unsupported content generation provider: ${provider}`);
    },
    [generateLocalNote]
  );

  return { generateContentService };
};
