import { useOptionsBar } from "../components/optionsBar/context/optionBarContext";

export const useContentListSort = () => useOptionsBar((state) => state.sortBy);
