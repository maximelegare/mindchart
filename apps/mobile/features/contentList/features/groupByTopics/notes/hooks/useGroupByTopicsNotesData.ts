import { useControllers } from "@/api/controllers/useControllers";
import { useFocusEffect } from "expo-router";
import { useCallback } from "react";
import { parseTopicsWithNotesAndThoughts } from "../utils/parseTopicsWithNotesAndThoughts";

export const useGroupByTopicsNotesData = () => {
  const { useFetchAllTopicsWithAssociatedNotesAndThoughtsQuery } =
    useControllers().topics;
  const { data, refetch } =
    useFetchAllTopicsWithAssociatedNotesAndThoughtsQuery();

  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch])
  );

  return parseTopicsWithNotesAndThoughts(data);
};
