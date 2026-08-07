import React, { useMemo, useState } from "react";
import {
  Pressable,
  ScrollView,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import {
  BottomSheet,
  BottomSheetContent,
  BottomSheetHeader,
  BottomSheetOpenTrigger,
  BottomSheetView,
} from "@/components/primitives/bottomSheet/bottom-sheet.native";
import { Typography } from "@/components/ui";
import { Button } from "@/components/ui/button";
import { Check } from "@/lib/icons/Check";
import { useBottomSheetModal } from "@gorhom/bottom-sheet";
import { useColorScheme } from "@/lib/useColorScheme";
import { hsl } from "@/utils/hsl";
import { cn } from "@/lib/cn";
import { useControllers } from "@/api/controllers/useControllers";
import { Icon } from "@/components/ui/icons/icon";
import { X } from "@/lib/icons/Times";
import { generateID } from "@/utils/genrateID";
import { useModal } from "@/components/ui/modal/modal";
import type { Location } from "@repo/zod-schemas/src/schemas";

export const LocationSelector = ({
  selectedLocationId,
  selectedLocationName,
  onChange,
  maxChars = 16,
}: {
  selectedLocationId: string | null | undefined;
  selectedLocationName?: string | null;
  onChange: (location: Location | null) => void;
  maxChars?: number;
}) => {
  const { colorScheme } = useColorScheme();
  const { openModal, closeModal } = useModal();
  const { locations } = useControllers();
  const { data: allLocations = [], refetch } =
    locations.useFetchAllLocationsQuery();
  const { mutateAsync: insertLocation } = locations.useInsertLocationMutation();
  const { mutateAsync: deleteLocation } = locations.useDeleteLocationMutation();

  const [search, setSearch] = useState("");

  const label = useMemo(() => {
    if (!selectedLocationId) return "";
    const name =
      selectedLocationName ??
      allLocations.find((location) => location.id === selectedLocationId)
        ?.name ??
      "";
    if (maxChars > 0 && name.length > maxChars) {
      return `${name.slice(0, maxChars)}…`;
    }
    return name;
  }, [allLocations, maxChars, selectedLocationId, selectedLocationName]);

  const filteredLocations = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return allLocations;
    return allLocations.filter((location) =>
      location.name.toLowerCase().includes(query)
    );
  }, [allLocations, search]);

  const exactMatch = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return null;
    return (
      allLocations.find((location) => location.name.toLowerCase() === query) ??
      null
    );
  }, [allLocations, search]);

  const canCreate = search.trim().length > 0 && !exactMatch;

  const handleSelect = (location: Location) => {
    onChange(location);
    setSearch("");
  };

  const handleCreate = async () => {
    const name = search.trim();
    if (!name || exactMatch) return;

    const location: Location = {
      id: generateID(),
      name,
      createdAt: new Date().toISOString(),
    };
    await insertLocation({ data: location });
    await refetch();
    onChange(location);
    setSearch("");
  };

  const handleDelete = (location: Location) => {
    openModal({
      modalName: "DELETE_LOCATION_CONFIRMATION",
      description: `Remove "${location.name}" from all notes that use it?`,
      onConfirm: async () => {
        await deleteLocation({ locationId: location.id });
        await refetch();
        if (selectedLocationId === location.id) {
          onChange(null);
        }
        closeModal();
      },
    });
  };

  return (
    <BottomSheet>
      <BottomSheetOpenTrigger asChild className="self-start">
        <TouchableOpacity className="flex-row items-center gap-1.5 self-start rounded-full bg-card px-2.5 py-1.5">
          <Icon name="map-pin" color="foreground" size={16} />
          {selectedLocationId ? (
            <Typography
              variant="p"
              className="shrink text-foreground"
              numberOfLines={1}
            >
              {label}
            </Typography>
          ) : (
            <Icon name="plus" color="foreground" size={16} />
          )}
        </TouchableOpacity>
      </BottomSheetOpenTrigger>
      <BottomSheetContent
        style={{ zIndex: 100 }}
        enablePanDownToClose
        enableContentPanningGesture={false}
        enableDynamicSizing={false}
        snapPoints={["100%"]}
      >
        <BottomSheetView className="h-full flex-1 gap-4 bg-background px-4 pb-6 pt-4">
          <BottomSheetHeader className="bg-background">
            <Typography variant="h3" className="pb-1 text-foreground">
              Location
            </Typography>
          </BottomSheetHeader>

          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Search or add a location"
            placeholderTextColor={hsl("muted-foreground", colorScheme)}
            className="rounded-full border border-input bg-card px-4 py-2 text-foreground"
            onSubmitEditing={() => {
              if (exactMatch) {
                handleSelect(exactMatch);
                return;
              }
              if (canCreate) {
                void handleCreate();
              }
            }}
          />

          <ScrollView className="min-h-0 flex-1">
            <View className="w-full flex-col gap-1">
              {canCreate ? (
                <CreateLocationRow
                  name={search.trim()}
                  onPress={() => {
                    void handleCreate();
                  }}
                />
              ) : null}

              {filteredLocations.map((location) => (
                <LocationItem
                  key={location.id}
                  item={location}
                  selected={selectedLocationId === location.id}
                  onPress={() => handleSelect(location)}
                  onDelete={() => handleDelete(location)}
                />
              ))}

              {!canCreate && filteredLocations.length === 0 ? (
                <Typography className="py-4 text-center text-muted-foreground">
                  {allLocations.length === 0
                    ? "No locations yet. Type a name to add one."
                    : "No matching locations."}
                </Typography>
              ) : null}
            </View>
          </ScrollView>
        </BottomSheetView>
      </BottomSheetContent>
    </BottomSheet>
  );
};

function CreateLocationRow({
  name,
  onPress,
}: {
  name: string;
  onPress: () => void;
}) {
  const { dismiss } = useBottomSheetModal();

  return (
    <Pressable
      className="w-full rounded-lg px-2 py-4"
      onPress={() => {
        onPress();
        dismiss();
      }}
    >
      <Typography>Add “{name}”</Typography>
    </Pressable>
  );
}

function LocationItem({
  item,
  selected,
  onPress,
  onDelete,
}: {
  item: Location;
  selected: boolean;
  onPress: () => void;
  onDelete: () => void;
}) {
  const { dismiss } = useBottomSheetModal();

  return (
    <View
      className={cn(
        "w-full flex-row items-center gap-2 rounded-lg px-2 py-2",
        selected && "bg-border"
      )}
    >
      <Pressable
        className="min-w-0 flex-1 py-2"
        onPress={() => {
          onPress();
          dismiss();
        }}
      >
        <View className="flex-row items-center gap-2">
          <Typography className="min-w-0 flex-1">{item.name}</Typography>
          {selected ? <Check className="text-accent-foreground" /> : null}
        </View>
      </Pressable>
      <Button
        variant="ghost"
        size="sm"
        accessibilityRole="button"
        accessibilityLabel={`Remove ${item.name}`}
        onPress={onDelete}
      >
        <X className="text-muted-foreground" size={20} />
      </Button>
    </View>
  );
}
