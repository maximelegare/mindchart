import { useMutation } from "@tanstack/react-query";
import { InferMutationOptions, REACT_QUERY_KEYS } from "../endpoints/KEYS";
import {
  GenerateContentServiceInput,
  useGenerateContentService,
} from "../services/generateContentService";
import {
  TranscribeServiceInput,
  useTranscribeService,
} from "../services/transcribeService";

export const useAIController = () => {
  const useTranscribeServiceMutation = (
    options?: Partial<
      InferMutationOptions<
        ReturnType<typeof useTranscribeService>["transcribeService"]
      >
    >
  ) => {
    const { transcribeService } = useTranscribeService();

    return useMutation<
      Awaited<ReturnType<typeof transcribeService>>,
      Error,
      TranscribeServiceInput
    >({
      mutationKey: [REACT_QUERY_KEYS.transcribeService],
      mutationFn: transcribeService,
      ...options,
    });
  };

  const useGenerateContentServiceMutation = (
    options?: Partial<
      InferMutationOptions<
        ReturnType<typeof useGenerateContentService>["generateContentService"]
      >
    >
  ) => {
    const { generateContentService } = useGenerateContentService();

    return useMutation<
      Awaited<ReturnType<typeof generateContentService>>,
      Error,
      GenerateContentServiceInput
    >({
      mutationKey: [REACT_QUERY_KEYS.generateContentService],
      mutationFn: generateContentService,
      ...options,
    });
  };

  return {
    useTranscribeServiceMutation,
    useGenerateContentServiceMutation,
  };
};
