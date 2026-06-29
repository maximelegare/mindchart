import { useCallback } from "react";
import { useWhisperService } from "@/features/whisper/services/whisperService";
import { AIProvider } from "@repo/constants";

export type TranscribeServiceInput = {
  audioUri: string;
  provider: AIProvider;
};

export const useTranscribeService = () => {
  const { transcribeLocal } = useWhisperService();

  const transcribeService = useCallback(
    async ({ audioUri, provider }: TranscribeServiceInput): Promise<string> => {
      if (provider === "local") {
        return transcribeLocal(audioUri);
      }
      if (provider === "cloud") {
        throw new Error("Cloud transcription is not implemented yet");
      }
      throw new Error(`Unsupported transcription provider: ${provider}`);
    },
    [transcribeLocal]
  );

  return { transcribeService };
};
