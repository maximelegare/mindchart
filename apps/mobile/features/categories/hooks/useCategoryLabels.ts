import { useMemo } from "react";
import { CATEGORIES_TRANSLATIONS } from "@repo/sqlite";
import { useLocaleContext } from "@/features/translations/context/translations";
import {
  DEFAULT_LANGUAGE,
  resolveLanguageCode,
  type LanguageCode,
} from "@/features/translations/constants/lang";
import { useCategoryLabelsController } from "@/api/controllers/useCategoryLabelsController";

const defaultCategoryLabels = (lang: string): Map<string, string> => {
  const pack =
    CATEGORIES_TRANSLATIONS.find((entry) => entry.lang === lang) ??
    CATEGORIES_TRANSLATIONS.find((entry) => entry.lang === DEFAULT_LANGUAGE);
  return new Map(Object.entries(pack?.translations ?? {}));
};

export const useCategoryLabelsMap = (): Map<string, string> => {
  const { locale } = useLocaleContext();
  const lang = resolveLanguageCode(locale);
  const { useFetchCategoryLabelsByLangQuery } = useCategoryLabelsController();
  const { data } = useFetchCategoryLabelsByLangQuery(lang as LanguageCode);

  return useMemo(() => {
    const map = defaultCategoryLabels(lang);
    if (data) {
      for (const [id, label] of data) {
        map.set(id, label);
      }
    }
    return map;
  }, [data, lang]);
};

export const useCategoryLabel = (categoryId: string | undefined): string => {
  const labels = useCategoryLabelsMap();
  if (!categoryId) return "";
  return labels.get(categoryId) ?? categoryId;
};
