import { useCallback } from "react";
import { useLlamaChat } from "@/features/llama/hooks/useLlamaChat";
import { stringToJson } from "@/features/llama/utils/stringToJson";
import { formatNote } from "@/features/notes/noteCreation/features/generateNote/utils/formatNote";
import { QUERIES } from "../data/models/chat/queries/queries";
import { ServiceResponse } from "@/api/utils/responseObject";
import { Note, Thought } from "@repo/zod-schemas";

export type GenerateLocalNoteResult = ServiceResponse<{
  note: Note;
  thoughts: Thought[];
} | null>;

export const useLlamaService = () => {
  const { generate, currentModelId } = useLlamaChat();

  const generateLocalNote = useCallback(
    async (transcript: string): Promise<GenerateLocalNoteResult> => {
      if (!currentModelId) {
        return ServiceResponse.failure("Model not selected", null);
      }

      if (!(currentModelId in QUERIES)) {
        return ServiceResponse.failure("Unsupported model query mapping", null);
      }

      try {
        const promptFn = QUERIES[currentModelId as keyof typeof QUERIES];
        const prompt = promptFn(transcript);

        const chatResponse = await generate(prompt);
        if (!chatResponse) {
          return ServiceResponse.failure("Response is null", null);
        }

        const chatResponseJson = stringToJson(chatResponse);
        if (!chatResponseJson) {
          return ServiceResponse.failure("Response is not valid JSON", null);
        }

        const data = formatNote(chatResponseJson, transcript);

        return ServiceResponse.success(
          "Success generating the note & thoughts",
          {
            thoughts: data.thoughts,
            note: data.note,
          }
        );
      } catch (error) {
        console.error("Error generating note:", error);
        return ServiceResponse.failure("Error generating note", null);
      }
    },
    [currentModelId, generate]
  );

  return { generateLocalNote };
};
