import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { REACT_QUERY_KEYS, ReactQueryOptions } from "@/api/endpoints/KEYS";
import {
  deleteLocationById,
  getAllLocations,
  insertLocation,
} from "@/api/endpoints/locations";
import type { Location } from "@repo/zod-schemas/src/schemas";

export const useLocationsController = () => {
  const useFetchAllLocationsQuery = (options?: ReactQueryOptions) =>
    useQuery<Awaited<ReturnType<typeof getAllLocations>>>({
      queryKey: [REACT_QUERY_KEYS.fetchAllLocations],
      queryFn: getAllLocations,
      ...options,
    });

  const useInsertLocationMutation = () => {
    const queryClient = useQueryClient();
    return useMutation<
      Awaited<ReturnType<typeof insertLocation>>,
      Error,
      { data: Location }
    >({
      mutationKey: [REACT_QUERY_KEYS.insertLocation],
      mutationFn: ({ data }) => insertLocation(data),
      onSuccess: async () => {
        await queryClient.invalidateQueries({
          queryKey: [REACT_QUERY_KEYS.fetchAllLocations],
        });
      },
    });
  };

  const useDeleteLocationMutation = () => {
    const queryClient = useQueryClient();
    return useMutation<
      Awaited<ReturnType<typeof deleteLocationById>>,
      Error,
      { locationId: string }
    >({
      mutationKey: [REACT_QUERY_KEYS.deleteLocation],
      mutationFn: ({ locationId }) => deleteLocationById(locationId),
      onSuccess: async () => {
        await queryClient.invalidateQueries({
          queryKey: [REACT_QUERY_KEYS.fetchAllLocations],
        });
        await queryClient.invalidateQueries({
          queryKey: [REACT_QUERY_KEYS.fetchNoteDetails],
        });
        await queryClient.invalidateQueries({
          queryKey: [REACT_QUERY_KEYS.fetchNotesAndThoughts],
        });
      },
    });
  };

  return {
    useFetchAllLocationsQuery,
    useInsertLocationMutation,
    useDeleteLocationMutation,
  };
};
