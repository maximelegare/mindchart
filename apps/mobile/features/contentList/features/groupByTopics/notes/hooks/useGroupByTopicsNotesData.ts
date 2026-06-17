import { useControllers } from "@/api/controllers/useControllers";
import { useMemo } from "react";
import { parseTopicsWithNotesAndThoughts } from "../utils/parseTopicsWithNotesAndThoughts";

export const useGroupByTopicsNotesData = () => {
  const { useFetchAllTopicsWithAssociatedNotesAndThoughtsQuery } =
    useControllers().topics;
  const { data } = useFetchAllTopicsWithAssociatedNotesAndThoughtsQuery();

  return useMemo(() => parseTopicsWithNotesAndThoughts(data), [data]);
};
