import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { REACT_QUERY_KEYS, ReactQueryOptions } from "@/api/endpoints/KEYS";
import {
  getAllPersons,
  insertPerson,
  upsertPersonsFromContacts,
} from "@/api/endpoints/persons";
import { Person } from "@repo/zod-schemas";

export const usePersonsController = () => {
  const useFetchAllPersonsQuery = (options?: ReactQueryOptions) =>
    useQuery<Awaited<ReturnType<typeof getAllPersons>>>({
      queryKey: [REACT_QUERY_KEYS.fetchAllPersons],
      queryFn: getAllPersons,
      ...options,
    });

  const useInsertPersonMutation = () => {
    const queryClient = useQueryClient();
    return useMutation<
      Awaited<ReturnType<typeof insertPerson>>,
      Error,
      { data: Person }
    >({
      mutationKey: [REACT_QUERY_KEYS.insertPerson],
      mutationFn: ({ data }) => insertPerson(data),
      onSuccess: async () => {
        await queryClient.invalidateQueries({
          queryKey: [REACT_QUERY_KEYS.fetchAllPersons],
        });
      },
    });
  };

  const useUpsertPersonsFromContactsMutation = () => {
    const queryClient = useQueryClient();
    return useMutation<
      Awaited<ReturnType<typeof upsertPersonsFromContacts>>,
      Error,
      { contacts: Person[] }
    >({
      mutationKey: [REACT_QUERY_KEYS.upsertPersonsFromContacts],
      mutationFn: ({ contacts }) => upsertPersonsFromContacts(contacts),
      onSuccess: async () => {
        await queryClient.invalidateQueries({
          queryKey: [REACT_QUERY_KEYS.fetchAllPersons],
        });
      },
    });
  };

  return {
    useFetchAllPersonsQuery,
    useInsertPersonMutation,
    useUpsertPersonsFromContactsMutation,
  };
};
