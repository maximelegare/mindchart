import { useCallback } from "react";
import { useLlamaChat } from "@/features/llama/hooks/useLlamaChat";
import { stringToJson } from "@/features/llama/utils/stringToJson";
import { formatNote } from "@/features/notes/noteCreation/features/generateNote/utils/formatNote";
import { useTopicService } from "@/features/topics/services/topicService";
import { QUERIES } from "../data/models/chat/queries/queries";
import { ServiceResponse } from "@/api/utils/responseObject";
import { Note, Thought, Topic } from "@repo/zod-schemas";

export type GenerateLocalNoteResult = ServiceResponse<{
  note: Note;
  thoughts: Thought[];
  topic: Topic;
} | null>;

export const useLlamaService = () => {
  const { generate, currentModelId } = useLlamaChat();
  const { findClosestTopic } = useTopicService();

  const generateLocalNote = useCallback(
    async (
      transcript: string,
      categories: string
    ): Promise<GenerateLocalNoteResult> => {
      if (!currentModelId) {
        return ServiceResponse.failure("Model not selected", null);
      }

      if (!(currentModelId in QUERIES)) {
        return ServiceResponse.failure("Unsupported model query mapping", null);
      }

      try {
        const promptFn = QUERIES[currentModelId as keyof typeof QUERIES];
        const prompt = promptFn(transcript, { categories });

        const chatResponse = await generate(prompt);
        if (!chatResponse) {
          return ServiceResponse.failure("Response is null", null);
        }

        const chatResponseJson = stringToJson(chatResponse);
        if (!chatResponseJson) {
          return ServiceResponse.failure("Response is not valid JSON", null);
        }

        const data = formatNote(chatResponseJson, transcript);
        const closestTopic = await findClosestTopic(data.note.topic);

        const { topic: _topic, ...noteWithoutTopic } = data.note;

        if (closestTopic.isNew) {
          return ServiceResponse.success(
            "Success generating the note & thoughts",
            {
              thoughts: data.thoughts,
              note: { ...noteWithoutTopic, topicId: closestTopic.id },
              topic: closestTopic,
            }
          );
        }

        return ServiceResponse.success(
          "Success generating the note & thoughts",
          {
            thoughts: data.thoughts,
            note: { ...noteWithoutTopic, topicId: closestTopic.id },
            topic: closestTopic,
          }
        );
      } catch (error) {
        console.error("Error generating note:", error);
        return ServiceResponse.failure("Error generating note", null);
      }
    },
    [currentModelId, findClosestTopic, generate]
  );

  return { generateLocalNote };
};
