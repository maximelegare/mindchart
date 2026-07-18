import { useControllers } from "@/api/controllers/useControllers";
import { FilterChip } from "@/features/contentList/components/optionsBar/components/filterChips";
import { CategoryKey } from "@repo/sqlite";
import { CATEGORIES_COLORS } from "@repo/theme/categories";
import React, { ReactNode, useMemo } from "react";
import { View } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { useGraphStore } from "../context/graphContext";

type ChipItem = {
  id: string;
  label: string;
  colorBadge?: string;
};

type GraphFilterChipsProps = {
  leading?: ReactNode;
};

export function GraphFilterChips({ leading }: GraphFilterChipsProps) {
  const mode = useGraphStore((state) => state.mode);
  const selectedTopicId = useGraphStore((state) => state.selectedTopicId);
  const selectedCategoryId = useGraphStore((state) => state.selectedCategoryId);
  const setSelectedTopicId = useGraphStore((state) => state.setSelectedTopicId);
  const setSelectedCategoryId = useGraphStore(
    (state) => state.setSelectedCategoryId
  );

  const showCategories = mode === "category";

  const { useFetchAllTopicsWithNotesInfosQuery } = useControllers().topics;
  const { useFetchAllCategoriesWithThoughtsInfosQuery } =
    useControllers().categories;

  const { data: topicsData } = useFetchAllTopicsWithNotesInfosQuery({
    enabled: !showCategories,
  });
  const { data: categoriesData } = useFetchAllCategoriesWithThoughtsInfosQuery({
    enabled: showCategories,
  });

  const chips: ChipItem[] = useMemo(() => {
    if (showCategories) {
      if (!categoriesData || !Array.isArray(categoriesData)) return [];
      return categoriesData
        .filter((category) => (category.thoughtCount ?? 0) > 0)
        .map((category) => {
          const categoryKey = category.id.toLowerCase() as CategoryKey;
          return {
            id: category.id,
            label: category.name,
            colorBadge: CATEGORIES_COLORS[categoryKey],
          };
        });
    }

    if (!topicsData || !Array.isArray(topicsData)) return [];
    return topicsData
      .filter((topic) => (topic.noteCount ?? 0) > 0)
      .map((topic) => ({
        id: topic.id,
        label: topic.name,
      }));
  }, [categoriesData, showCategories, topicsData]);

  const selectedId = showCategories ? selectedCategoryId : selectedTopicId;
  const onSelect = (id: string | null) => {
    if (showCategories) {
      setSelectedCategoryId(id);
      return;
    }
    setSelectedTopicId(id);
  };

  if (!leading && chips.length === 0) return null;

  return (
    <View className="h-full w-full flex-row items-center gap-2">
      {leading ? <View className="shrink-0">{leading}</View> : null}
      {chips.length > 0 ? (
        <ScrollView
          horizontal
          nestedScrollEnabled
          keyboardShouldPersistTaps="handled"
          showsHorizontalScrollIndicator={false}
          style={{ flex: 1 }}
          contentContainerStyle={{
            gap: 8,
            alignItems: "center",
            paddingRight: 4,
          }}
        >
          {chips.map((chip) => (
            <FilterChip
              key={chip.id}
              label={chip.label}
              colorBadge={chip.colorBadge}
              selected={selectedId === chip.id}
              onPress={() => onSelect(selectedId === chip.id ? null : chip.id)}
            />
          ))}
        </ScrollView>
      ) : null}
    </View>
  );
}
