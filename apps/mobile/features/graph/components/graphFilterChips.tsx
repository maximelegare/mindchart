import { useControllers } from "@/api/controllers/useControllers";
import { FilterChip } from "@/features/contentList/components/optionsBar/components/filters/filterChips";
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
  const selectedFolderId = useGraphStore((state) => state.selectedFolderId);
  const selectedCategoryId = useGraphStore((state) => state.selectedCategoryId);
  const setSelectedFolderId = useGraphStore(
    (state) => state.setSelectedFolderId
  );
  const setSelectedCategoryId = useGraphStore(
    (state) => state.setSelectedCategoryId
  );

  const showCategories = mode === "category";

  const { useFetchAllFoldersWithNotesInfosQuery } = useControllers().folders;
  const { useFetchAllCategoriesWithThoughtsInfosQuery } =
    useControllers().categories;

  const { data: foldersData } = useFetchAllFoldersWithNotesInfosQuery({
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
        .map((category) => ({
          id: category.id,
          label: category.name,
          colorBadge: category.color,
        }));
    }

    if (!foldersData || !Array.isArray(foldersData)) return [];
    return foldersData
      .filter((folder) => (folder.noteCount ?? 0) > 0)
      .map((folder) => ({
        id: folder.id,
        label: folder.label,
      }));
  }, [categoriesData, foldersData, showCategories]);

  const selectedId = showCategories ? selectedCategoryId : selectedFolderId;
  const onSelect = (id: string | null) => {
    if (showCategories) {
      setSelectedCategoryId(id);
      return;
    }
    setSelectedFolderId(id);
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
