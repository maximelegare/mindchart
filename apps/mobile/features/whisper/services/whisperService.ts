import { useCallback } from "react";
import { useWhisper } from "../hooks/useWhisperModels";

export const useWhisperService = () => {
  const { transcribe } = useWhisper();

  const transcribeLocal = useCallback(
    async (audioUri: string): Promise<string> => {
      if (!audioUri) {
        throw new Error("Audio URI is required");
      }

      try {
        const result = await transcribe(audioUri);
        if (!result) {
          throw new Error("Transcription result is empty");
        }
        return result;
      } catch (error) {
        console.error(error);
        throw new Error("Failed to transcribe audio");
      }
    },
    [transcribe]
  );

  return { transcribeLocal };
};
