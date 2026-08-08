import React, { useMemo, useState } from "react";
import { Pressable, ScrollView, TextInput, View } from "react-native";
import { Typography } from "@/components/ui";
import { Button } from "@/components/ui/button";
import { Check } from "@/lib/icons/Check";
import { cn } from "@/lib/cn";
import { useColorScheme } from "@/lib/useColorScheme";
import { hsl } from "@/utils/hsl";
import { useModal } from "@/components/ui/modal/modal";

export type FilterAttributeOption = {
  id: string;
  label: string;
  leading?: React.ReactNode;
};

type FilterAttributePickerProps = {
  options: FilterAttributeOption[];
  selectedIds: string[];
  onChange: (ids: string[]) => void;
  /** `single` replaces the selection; `multiple` toggles ids in the list. */
  selectionMode?: "single" | "multiple";
  searchable?: boolean;
  searchPlaceholder?: string;
  emptyLabel?: string;
};

export const FilterAttributePicker = ({
  options,
  selectedIds,
  onChange,
  selectionMode = "multiple",
  searchable = false,
  searchPlaceholder = "Search…",
  emptyLabel = "Nothing to filter by yet.",
}: FilterAttributePickerProps) => {
  const { closeModal } = useModal();
  const { colorScheme } = useColorScheme();
  const [search, setSearch] = useState("");
  const selectedSet = useMemo(() => new Set(selectedIds), [selectedIds]);
  const inputBg = hsl("card", colorScheme);
  const inputFg = hsl("foreground", colorScheme);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return options;
    return options.filter((option) =>
      option.label.toLowerCase().includes(query)
    );
  }, [options, search]);

  const toggle = (id: string) => {
    if (selectionMode === "single") {
      onChange(selectedSet.has(id) ? [] : [id]);
      return;
    }
    if (selectedSet.has(id)) {
      onChange(selectedIds.filter((selectedId) => selectedId !== id));
      return;
    }
    onChange([...selectedIds, id]);
  };

  return (
    <View className="gap-3" style={{ maxHeight: 420 }}>
      {searchable ? (
        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder={searchPlaceholder}
          placeholderTextColor={hsl("muted-foreground", colorScheme)}
          className="rounded-lg px-3 py-2.5 text-base"
          style={{ backgroundColor: inputBg, color: inputFg }}
          autoCorrect={false}
          autoCapitalize="none"
        />
      ) : null}

      <ScrollView
        style={{ maxHeight: 300 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {filtered.length === 0 ? (
          <Typography variant="p" className="py-4 text-muted-foreground">
            {emptyLabel}
          </Typography>
        ) : (
          <View className="gap-1">
            {filtered.map((option) => {
              const selected = selectedSet.has(option.id);
              return (
                <Pressable
                  key={option.id}
                  onPress={() => toggle(option.id)}
                  className={cn(
                    "w-full flex-row items-center justify-between gap-2 rounded-lg px-2 py-3",
                    selected && "bg-border"
                  )}
                >
                  <View className="min-w-0 flex-1 flex-row items-center gap-2">
                    {option.leading}
                    <Typography
                      variant="p"
                      className="shrink text-foreground"
                      numberOfLines={1}
                    >
                      {option.label}
                    </Typography>
                  </View>
                  {selected ? (
                    <Check className="text-accent-foreground" />
                  ) : null}
                </Pressable>
              );
            })}
          </View>
        )}
      </ScrollView>

      <View className="flex-row justify-end">
        <Button variant="default" onPress={closeModal}>
          <Typography>Done</Typography>
        </Button>
      </View>
    </View>
  );
};
