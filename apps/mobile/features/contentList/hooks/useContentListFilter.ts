import { useMemo } from "react";
import { useOptionsBar } from "../components/optionsBar/context/optionBarContext";
import type { NoteAttributeFilters } from "../utils/filterNotesByAttributes";

export const useSelectedFolderId = () =>
  useOptionsBar((state) => state.selectedFolderId);

export const useSelectedCategoryId = () =>
  useOptionsBar((state) => state.selectedCategoryId);

export const useNotesAttributeFilters = (): NoteAttributeFilters => {
  const personIds = useOptionsBar((state) => state.filterPersonIds);
  const feelings = useOptionsBar((state) => state.filterFeelings);
  const locationIds = useOptionsBar((state) => state.filterLocationIds);
  return useMemo(
    () => ({ personIds, feelings, locationIds }),
    [feelings, locationIds, personIds]
  );
};
