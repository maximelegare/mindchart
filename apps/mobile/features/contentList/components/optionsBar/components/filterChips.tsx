import { useControllers } from "@/api/controllers/useControllers";
import { Typography } from "@/components/ui";
import { useColorScheme } from "@/lib/useColorScheme";
import { hsl } from "@/utils/hsl";
import { CategoryKey } from "@repo/sqlite";
import { CATEGORIES_COLORS } from "@repo/theme/categories";
import { ReactNode, useMemo } from "react";
import { Pressable, View } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { useOptionsBar } from "../context/optionBarContext";
import { Icon } from "@/components/ui/icons/icon";
import { IconName } from "@/components/ui/icons/icon-registry";

type ChipItem = {
  id: string;
  label: string;
  colorBadge?: string;
};

type FilterChipProps = {
  icon?: IconName;
  label?: string;
  selected: boolean;
  colorBadge?: string;
  onPress: () => void;
};

export function FilterChip({
  label,
  selected,
  colorBadge,
  onPress,
  icon,
}: FilterChipProps) {
  const { colorScheme } = useColorScheme();
  const selectedFg = hsl("text", colorScheme);
  const mutedFg = hsl("muted-foreground", colorScheme);
  const borderColor = hsl(selected ? "primary" : "border", colorScheme);
  const backgroundColor = hsl(selected ? "muted" : "background", colorScheme);

  return (
    <Pressable
      onPress={onPress}
      className="flex-row items-center gap-1.5 rounded-full border px-2.5 py-1 min-w-10"
      style={{ borderColor, backgroundColor }}
      accessibilityRole="button"
      accessibilityState={{ selected }}
    >
      {colorBadge ? (
        <View
          className="h-2.5 w-2.5 rounded-full"
          style={{ backgroundColor: colorBadge }}
        />
      ) : null}
      {icon ? <Icon name={icon} color="text" size={16} /> : null}
      {label ? (
        <Typography
          variant="p"
          className="text-xs"
          style={{ color: selected ? selectedFg : mutedFg }}
        >
          {label}
        </Typography>
      ) : null}
    </Pressable>
  );
}

type ContentListFilterChipsProps = {
  /** Fixed control shown before the chip scroller (e.g. options button). */
  leading?: ReactNode;
};

export function ContentListFilterChips({
  leading,
}: ContentListFilterChipsProps) {
  const groupBy = useOptionsBar((state) => state.groupBy);
  const displayMode = useOptionsBar((state) => state.displayMode);
  const selectedTopicId = useOptionsBar((state) => state.selectedTopicId);
  const selectedCategoryId = useOptionsBar((state) => state.selectedCategoryId);
  const handleSelectedTopicChange = useOptionsBar(
    (state) => state.handleSelectedTopicChange
  );
  const handleSelectedCategoryChange = useOptionsBar(
    (state) => state.handleSelectedCategoryChange
  );

  const { useFetchAllTopicsWithNotesInfosQuery } = useControllers().topics;
  const { useFetchAllCategoriesWithThoughtsInfosQuery } =
    useControllers().categories;

  const showCategories =
    groupBy === "categories" || displayMode === "categories";
  const showTopics = !showCategories;

  const { data: topicsData } = useFetchAllTopicsWithNotesInfosQuery({
    enabled: showTopics,
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
          colorBadge: CATEGORIES_COLORS[category.id as CategoryKey],
        }));
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
      handleSelectedCategoryChange(id);
      return;
    }
    handleSelectedTopicChange(id);
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
