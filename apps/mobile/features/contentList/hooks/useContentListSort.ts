import { useMemo } from "react";
import { useOptionsBar } from "../components/optionsBar/context/optionBarContext";
import type { SortOptions } from "../utils/sortContentList";

export const useContentListSort = (): SortOptions => {
  const field = useOptionsBar((state) => state.sortField);
  const direction = useOptionsBar((state) => state.sortDirection);
  return useMemo(() => ({ field, direction }), [field, direction]);
};
