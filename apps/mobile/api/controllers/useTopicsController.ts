import { useMutation, useQuery } from "@tanstack/react-query";
import { REACT_QUERY_KEYS, ReactQueryOptions } from "@/api/endpoints/KEYS";
import { getAllTopics, insertNewTopic } from "../endpoints/topics";
import { Topic } from "@repo/zod-schemas";

export const useTopicsController = () => {
  const useFetchAllTopicsQuery = (options?: ReactQueryOptions) =>
    useQuery<Awaited<ReturnType<typeof getAllTopics>>>({
      queryKey: [REACT_QUERY_KEYS.fetchAllTopics],
      queryFn: getAllTopics,
      ...options,
    });

  const useInsertNewTopicMutation = () =>
    useMutation<
      Awaited<ReturnType<typeof insertNewTopic>>,
      Error,
      { data: Topic }
    >({
      mutationKey: [REACT_QUERY_KEYS.insertNewTopic],
      mutationFn: ({ data }) => insertNewTopic(data),
    });

  return {
    useFetchAllTopicsQuery,
    useInsertNewTopicMutation,
  };
};
