import { useMutation } from "@tanstack/react-query";
import { InferMutationOptions, REACT_QUERY_KEYS } from "@/api/endpoints/KEYS";
import { exportDatabase } from "../endpoints/settings";

export const useSettingsController = () => {
  const useExportDatabaseMutation = (
    options?: Partial<InferMutationOptions<typeof exportDatabase>>
  ) =>
    useMutation({
      mutationKey: [REACT_QUERY_KEYS.exportDatabase],
      mutationFn: exportDatabase,
      ...options,
    });

  return {
    useExportDatabaseMutation,
  };
};
