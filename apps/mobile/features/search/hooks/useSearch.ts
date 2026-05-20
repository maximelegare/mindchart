import { useSearchController } from "@/api/controllers/useSearch";

export const useSearch = (query: string) => {
  const { useSearchNotesQuery } = useSearchController();

  const { data: searchNotes, isLoading } = useSearchNotesQuery(query);

  return {
    searchNotes,
    isLoading,
  };
};
