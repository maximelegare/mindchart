import { useCallback } from "react";
import { useGenerateContentService } from "@/api/services/generateContentService";
import { useTranscribeService } from "@/api/services/transcribeService";
import { ServiceResponse } from "@/api/utils/responseObject";
import { GenerateLocalNoteResult } from "@/features/llama/services/llamaService";
import { GenerateNoteService } from "../types";

export const useGenerateNoteService = () => {
  const { transcribeService } = useTranscribeService();
  const { generateContentService } = useGenerateContentService();

  const generateNoteService = useCallback(
    async ({
      data,
      options,
    }: GenerateNoteService): Promise<GenerateLocalNoteResult> => {
      const whisperProvider = options?.providers?.whisper ?? "local";
      const llamaProvider = options?.providers?.llamaChat ?? "local";

      try {
        let transcript = data.text?.trim() ?? null;

        if (!transcript && data.audio?.uri) {
          transcript = await transcribeService({
            audioUri: data.audio.uri,
            provider: whisperProvider,
          });
        }

        if (!transcript) {
          throw new Error("Transcript is required");
        }

        return generateContentService({
          transcript,
          categories: data.categories,
          provider: llamaProvider,
        });
      } catch (error) {
        console.error("Error generating note:", error);
        return ServiceResponse.failure("Error generating note", null);
      }
    },
    [generateContentService, transcribeService]
  );

  return { generateNoteService };
};
