import React, { useCallback, useMemo } from "react";
import { View } from "react-native";
import { FEELINGS_DEFINITIONS } from "@repo/sqlite";
import type { FeelingValue } from "@repo/zod-schemas/src/schemas";
import {
  BottomSheet,
  BottomSheetContent,
  BottomSheetHeader,
  BottomSheetView,
  useBottomSheet,
} from "@/components/primitives/bottomSheet/bottom-sheet.native";
import { Typography } from "@/components/ui";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icons/icon";
import { IconName } from "@/components/ui/icons/icon-registry";
import { useModal } from "@/components/ui/modal/modal";
import { useControllers } from "@/api/controllers/useControllers";
import { OptionChip } from "@/features/contentList/components/optionsBar/components/options/optionChip";
import { useOptionsBar } from "@/features/contentList/components/optionsBar/context/optionBarContext";
import { hasActiveAttributeFilters } from "@/features/contentList/utils/filterNotesByAttributes";
import {
  FilterAttributePicker,
  type FilterAttributeOption,
} from "./filterAttributePicker";

export const NotesFilterSheet = () => {
  const sheet = useBottomSheet();
  const { openModal } = useModal();

  const filterPersonIds = useOptionsBar((state) => state.filterPersonIds);
  const filterFeelings = useOptionsBar((state) => state.filterFeelings);
  const filterLocationIds = useOptionsBar((state) => state.filterLocationIds);
  const selectedFolderId = useOptionsBar((state) => state.selectedFolderId);
  const setFilterPersonIds = useOptionsBar((state) => state.setFilterPersonIds);
  const setFilterFeelings = useOptionsBar((state) => state.setFilterFeelings);
  const setFilterLocationIds = useOptionsBar(
    (state) => state.setFilterLocationIds
  );
  const handleSelectedFolderChange = useOptionsBar(
    (state) => state.handleSelectedFolderChange
  );
  const clearAttributeFilters = useOptionsBar(
    (state) => state.clearAttributeFilters
  );

  const { data: allFolders = [] } =
    useControllers().folders.useFetchAllFoldersQuery();

  const hasFilters =
    hasActiveAttributeFilters({
      personIds: filterPersonIds,
      feelings: filterFeelings,
      locationIds: filterLocationIds,
    }) || selectedFolderId != null;

  const activeCount =
    filterPersonIds.length +
    filterFeelings.length +
    filterLocationIds.length +
    (selectedFolderId != null ? 1 : 0);

  const openFolderPicker = useCallback(() => {
    openModal({
      title: "Folder",
      aboveBottomSheet: true,
      dismissOnBackgroundPress: true,
      customContent: () => (
        <FolderFilterModalContent onChange={handleSelectedFolderChange} />
      ),
    });
  }, [handleSelectedFolderChange, openModal]);

  const openPeoplePicker = useCallback(() => {
    openModal({
      title: "People",
      aboveBottomSheet: true,
      dismissOnBackgroundPress: true,
      customContent: () => (
        <PeopleFilterModalContent onChange={setFilterPersonIds} />
      ),
    });
  }, [openModal, setFilterPersonIds]);

  const openFeelingPicker = useCallback(() => {
    openModal({
      title: "Feeling",
      aboveBottomSheet: true,
      dismissOnBackgroundPress: true,
      customContent: () => (
        <FeelingFilterModalContent onChange={setFilterFeelings} />
      ),
    });
  }, [openModal, setFilterFeelings]);

  const openLocationPicker = useCallback(() => {
    openModal({
      title: "Location",
      aboveBottomSheet: true,
      dismissOnBackgroundPress: true,
      customContent: () => (
        <LocationFilterModalContent onChange={setFilterLocationIds} />
      ),
    });
  }, [openModal, setFilterLocationIds]);

  const folderSummary = useMemo(() => {
    if (!selectedFolderId) return "Any";
    return (
      allFolders.find((folder) => folder.id === selectedFolderId)?.label ??
      "1 selected"
    );
  }, [allFolders, selectedFolderId]);

  const peopleSummary =
    filterPersonIds.length === 0 ? "Any" : `${filterPersonIds.length} selected`;
  const feelingSummary =
    filterFeelings.length === 0
      ? "Any"
      : filterFeelings
          .map(
            (value) =>
              FEELINGS_DEFINITIONS.find((feeling) => feeling.value === value)
                ?.emoji ?? String(value)
          )
          .join(" ");
  const locationSummary =
    filterLocationIds.length === 0
      ? "Any"
      : `${filterLocationIds.length} selected`;

  return (
    <View className="shrink-0">
      <OptionChip
        icon="funnel"
        label={hasFilters ? `Filters (${activeCount})` : "Filters"}
        selected={hasFilters}
        onPress={() => sheet.open()}
      />

      {/* Keep sheet out of the options-row flex flow so gap stays even. */}
      <BottomSheet
        style={{
          position: "absolute",
          width: 0,
          height: 0,
          overflow: "hidden",
        }}
      >
        <BottomSheetContent
          ref={sheet.ref}
          style={{ zIndex: 200 }}
          enablePanDownToClose
          enableContentPanningGesture={false}
        >
          <BottomSheetView className="gap-3 bg-background pt-4">
            <BottomSheetHeader
              className="bg-background"
              onDismiss={() => sheet.close()}
            >
              <View className="flex-row items-center gap-2">
                <Icon name="funnel" color="foreground" size={18} />
                <Typography variant="h3">Filters</Typography>
              </View>
            </BottomSheetHeader>

            <FilterRow
              icon="folder"
              label="Folder"
              summary={folderSummary}
              onPress={openFolderPicker}
            />
            <FilterRow
              icon="user-round"
              label="People"
              summary={peopleSummary}
              onPress={openPeoplePicker}
            />
            <FilterRow
              icon="heart"
              label="Feeling"
              summary={feelingSummary}
              onPress={openFeelingPicker}
            />
            <FilterRow
              icon="map-pin"
              label="Location"
              summary={locationSummary}
              onPress={openLocationPicker}
            />

            {hasFilters ? (
              <Button
                variant="outline"
                size="default"
                onPress={clearAttributeFilters}
              >
                <Typography variant="h3">Clear filters</Typography>
              </Button>
            ) : null}
          </BottomSheetView>
        </BottomSheetContent>
      </BottomSheet>
    </View>
  );
};

function FilterRow({
  icon,
  label,
  summary,
  onPress,
}: {
  icon: IconName;
  label: string;
  summary: string;
  onPress: () => void;
}) {
  return (
    <Button variant="outline" size="default" onPress={onPress}>
      <View className="w-full flex-row items-center justify-between gap-2">
        <View className="flex-row items-center gap-2">
          <Icon name={icon} color="foreground" size={18} />
          <Typography variant="h3">{label}</Typography>
        </View>
        <Typography variant="p" className="text-muted-foreground">
          {summary}
        </Typography>
      </View>
    </Button>
  );
}

function FolderFilterModalContent({
  onChange,
}: {
  onChange: (folderId: string | null) => void;
}) {
  const selectedFolderId = useOptionsBar((state) => state.selectedFolderId);
  const { data: folders = [] } =
    useControllers().folders.useFetchAllFoldersWithNotesInfosQuery();
  const options = useMemo<FilterAttributeOption[]>(
    () =>
      (folders ?? [])
        .filter((folder) => (folder.noteCount ?? 0) > 0)
        .map((folder) => ({
          id: folder.id,
          label: folder.label,
        })),
    [folders]
  );

  return (
    <FilterAttributePicker
      options={options}
      selectedIds={selectedFolderId ? [selectedFolderId] : []}
      onChange={(ids) => onChange(ids[0] ?? null)}
      selectionMode="single"
      searchable
      searchPlaceholder="Search folders…"
      emptyLabel="No folders with notes yet."
    />
  );
}

function PeopleFilterModalContent({
  onChange,
}: {
  onChange: (ids: string[]) => void;
}) {
  const selectedIds = useOptionsBar((state) => state.filterPersonIds);
  const { data: allPersons = [] } =
    useControllers().persons.useFetchAllPersonsQuery();
  const options = useMemo<FilterAttributeOption[]>(
    () =>
      allPersons.map((person) => ({
        id: person.id,
        label: person.name,
      })),
    [allPersons]
  );

  return (
    <FilterAttributePicker
      options={options}
      selectedIds={selectedIds}
      onChange={onChange}
      searchable
      searchPlaceholder="Search people…"
      emptyLabel="No people yet."
    />
  );
}

function FeelingFilterModalContent({
  onChange,
}: {
  onChange: (feelings: FeelingValue[]) => void;
}) {
  const selectedFeelings = useOptionsBar((state) => state.filterFeelings);
  const options = useMemo<FilterAttributeOption[]>(
    () =>
      FEELINGS_DEFINITIONS.map((feeling) => ({
        id: String(feeling.value),
        label: feeling.label,
        leading: <Typography>{feeling.emoji}</Typography>,
      })),
    []
  );

  return (
    <FilterAttributePicker
      options={options}
      selectedIds={selectedFeelings.map(String)}
      onChange={(ids) => onChange(ids.map((id) => Number(id) as FeelingValue))}
      emptyLabel="No feelings available."
    />
  );
}

function LocationFilterModalContent({
  onChange,
}: {
  onChange: (ids: string[]) => void;
}) {
  const selectedIds = useOptionsBar((state) => state.filterLocationIds);
  const { data: allLocations = [] } =
    useControllers().locations.useFetchAllLocationsQuery();
  const options = useMemo<FilterAttributeOption[]>(
    () =>
      allLocations.map((location) => ({
        id: location.id,
        label: location.name,
      })),
    [allLocations]
  );

  return (
    <FilterAttributePicker
      options={options}
      selectedIds={selectedIds}
      onChange={onChange}
      searchable
      searchPlaceholder="Search locations…"
      emptyLabel="No locations yet."
    />
  );
}
