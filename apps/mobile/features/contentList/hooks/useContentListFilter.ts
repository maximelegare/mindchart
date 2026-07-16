import { useOptionsBar } from "../components/optionsBar/context/optionBarContext";

export const useSelectedTopicId = () =>
  useOptionsBar((state) => state.selectedTopicId);

export const useSelectedCategoryId = () =>
  useOptionsBar((state) => state.selectedCategoryId);
