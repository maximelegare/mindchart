import { useCallback, useContext } from "react";
import { LlamaContextInstance } from "../context/llamaContext";
import { ModelId } from "../data/types";

export const useLlamaChat = () => {
  const context = useContext(LlamaContextInstance);
  if (!context) throw new Error("useLlama must be used within a LlamaProvider");

  /**
   * Generates text based on a prompt.
   * Supports an optional onToken callback for UI streaming.
   */
  const generate = useCallback(
    async (prompt: string, onToken?: (token: string) => void) => {
      if (!context.chatContext) {
        throw new Error(
          "Llama model not initialized. Call initializeModel first."
        );
      }

      const { text } = await context.chatContext.completion(
        {
          prompt: `User: ${prompt}\nAssistant:`,
          n_predict: 500,
          stop: ["User:", "</s>", "```", "}"],
          temperature: 0.1,
        },
        (data) => {
          if (onToken) onToken(data.token);
        }
      );

      return text;
    },
    [context.chatContext]
  );

  return {
    ...context,
    generate,
    currentModelId: context.currentChatModelId as ModelId,
    isReady:
      !!context.chatContext &&
      !context.isInitializingChat &&
      !context.isDownloading,
  };
};
