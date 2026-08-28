import { useQuery } from "@tanstack/react-query";
import { fetchCategoryTranslationsByLang } from "@/api/endpoints/categories";
import { REACT_QUERY_KEYS, ReactQueryOptions } from "@/api/endpoints/KEYS";

export const useCategoryLabelsController = () => {
  const useFetchCategoryLabelsByLangQuery = (
    lang: string,
    options?: ReactQueryOptions
  ) =>
    useQuery<Map<string, string>>({
      queryKey: [REACT_QUERY_KEYS.fetchCategoryTranslationsByLang, lang],
      queryFn: async () => {
        const translations = await fetchCategoryTranslationsByLang(lang);
        const map = new Map<string, string>();
        for (const translation of translations) {
          map.set(translation.id, translation.label);
        }
        return map;
      },
      staleTime: 60_000,
      ...options,
    });

  return { useFetchCategoryLabelsByLangQuery };
};
