import { useOptionsBar } from "../components/optionsBar/context/optionBarContext";

export const useSelectedFolderId = () =>
  useOptionsBar((state) => state.selectedFolderId);

export const useSelectedCategoryId = () =>
  useOptionsBar((state) => state.selectedCategoryId);
