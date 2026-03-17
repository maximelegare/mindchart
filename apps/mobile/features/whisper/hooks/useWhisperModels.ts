import { useCallback, useContext } from "react";

import { WhisperContextInstance } from "../context/whispterContext";

export const useWhisper = () => {
  const context = useContext(WhisperContextInstance);
  if (!context)
    throw new Error("useWhisper must be used within a WhisperProvider");

  const transcribe = useCallback(
    async (audioUri: string, options: any = {}) => {
      if (!context.whisperContext) throw new Error("Whisper not initialized");

      // whisper.rn's transcribe returns { stop, promise }
      const { promise } = context.whisperContext.transcribe(audioUri, {
        language: "en",
        ...options,
      });

      const { result } = await promise;
      return result;
    },
    [context.whisperContext]
  );

  return {
    ...context,
    transcribe,
    isReady: !!context.whisperContext && !context.isInitializing,
  };
};
