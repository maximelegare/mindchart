import { useMemo } from "react";
import { useLocaleContext } from "@/features/translations/context/translations";
import { useCategoryLabelsController } from "@/api/controllers/useCategoryLabelsController";
import { type LanguageCode } from "@/features/translations/constants/lang";

export const useCategoryLabelsMap = (): Map<string, string> => {
  const { locale } = useLocaleContext();
  const { useFetchCategoryLabelsByLangQuery } = useCategoryLabelsController();
  const { data } = useFetchCategoryLabelsByLangQuery(locale as LanguageCode);

  return useMemo(() => data ?? new Map<string, string>(), [data]);
};

export const useCategoryLabel = (categoryId: string | undefined): string => {
  const labels = useCategoryLabelsMap();
  if (!categoryId) return "";
  return labels.get(categoryId) ?? categoryId;
};
