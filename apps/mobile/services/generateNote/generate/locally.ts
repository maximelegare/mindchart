import { useLlamaChat } from "@/features/llama/hooks/useLlamaChat";
import { useWhisper } from "@/features/whisper/hooks/useWhisperModels";
import { GenerateNoteServiceData } from "../types";
import { QUERIES } from "@/features/llama/data/models/chat/queries/queries";
import { stringToJson } from "@/features/llama/utils/stringToJson";
import { ServiceResponse } from "@/api/utils/responseObject";
import { formatNote } from "../utils/formatNote";

export const useGenerateLocalNote = () => {
  const { transcribe } = useWhisper();
  const { generate, currentModelId } = useLlamaChat();

  const generateLocalNote = async ({
    text,
    audio,
    categories,
  }: GenerateNoteServiceData) => {
    if (!currentModelId) {
      throw new Error("Model not selected");
    }

    try {
      let transcript = "";

      if (text && text.length > 0) {
        transcript = text;
      } else if (audio?.uri) {
        transcript = await transcribe(audio?.uri);
      }

      if (transcript.length === 0) {
        throw new Error("Transcript is null");
      }

      if (currentModelId in QUERIES) {
        const promptFn = QUERIES[currentModelId as keyof typeof QUERIES];
        const prompt = promptFn(transcript, { categories });

        const response = await generate(prompt);
        if (!response) {
          throw new Error("Response is null");
        }

        const json = stringToJson(response);
        if (!json) {
          throw new Error("Response is not valid JSON");
        }

        const data = formatNote(json);
        return ServiceResponse.success(
          "Success generating the note & thoughts",
          data
        );
      }
    } catch (error) {
      console.error("Error generating note:", error);
      return ServiceResponse.failure("Error generating note", null);
    }
  };

  return {
    generateLocalNote,
  };
};
