import React, { useCallback, useMemo, type ReactNode } from "react";
import { View } from "react-native";
import { FEELINGS_DEFINITIONS } from "@repo/sqlite";
import type { FeelingValue } from "@repo/zod-schemas";
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
import { useSearchContext } from "@/features/search/context/search";
import {
  FilterAttributePicker,
  type FilterAttributeOption,
} from "./filterAttributePicker";
import {
  ClearFiltersLabel,
  FilterFeelingLabel,
  FilterFolderLabel,
  FilterLocationLabel,
  FilterOneSelectedSummary,
  FilterPeopleLabel,
  FiltersChipLabel,
  FiltersSheetTitle,
  filterEmptyFeelingsLabel,
  filterEmptyFoldersLabel,
  filterEmptyLocationsLabel,
  filterEmptyPeopleLabel,
  filterModalFeelingTitle,
  filterModalFolderTitle,
  filterModalLocationTitle,
  filterModalPeopleTitle,
  filterSearchFoldersPlaceholder,
  filterSearchLocationsPlaceholder,
  filterSearchPeoplePlaceholder,
  renderFilterSelectedSummary,
} from "./notesFilterLabels";

export type NotesFilterSource = "contentList" | "search";

export type NotesFilterControls = {
  filterPersonIds: string[];
  filterFeelings: FeelingValue[];
  filterLocationIds: string[];
  selectedFolderId: string | null;
  setFilterPersonIds: (ids: string[]) => void;
  setFilterFeelings: (feelings: FeelingValue[]) => void;
  setFilterLocationIds: (ids: string[]) => void;
  handleSelectedFolderChange: (folderId: string | null) => void;
  clearAttributeFilters: () => void;
};

function useNotesFilterControls(
  source: NotesFilterSource
): NotesFilterControls {
  const contentList: NotesFilterControls = {
    filterPersonIds: useOptionsBar((state) => state.filterPersonIds),
    filterFeelings: useOptionsBar((state) => state.filterFeelings),
    filterLocationIds: useOptionsBar((state) => state.filterLocationIds),
    selectedFolderId: useOptionsBar((state) => state.selectedFolderId),
    setFilterPersonIds: useOptionsBar((state) => state.setFilterPersonIds),
    setFilterFeelings: useOptionsBar((state) => state.setFilterFeelings),
    setFilterLocationIds: useOptionsBar((state) => state.setFilterLocationIds),
    handleSelectedFolderChange: useOptionsBar(
      (state) => state.handleSelectedFolderChange
    ),
    clearAttributeFilters: useOptionsBar(
      (state) => state.clearAttributeFilters
    ),
  };
  const search: NotesFilterControls = {
    filterPersonIds: useSearchContext((state) => state.filterPersonIds),
    filterFeelings: useSearchContext((state) => state.filterFeelings),
    filterLocationIds: useSearchContext((state) => state.filterLocationIds),
    selectedFolderId: useSearchContext((state) => state.selectedFolderId),
    setFilterPersonIds: useSearchContext((state) => state.setFilterPersonIds),
    setFilterFeelings: useSearchContext((state) => state.setFilterFeelings),
    setFilterLocationIds: useSearchContext(
      (state) => state.setFilterLocationIds
    ),
    handleSelectedFolderChange: useSearchContext(
      (state) => state.handleSelectedFolderChange
    ),
    clearAttributeFilters: useSearchContext(
      (state) => state.clearAttributeFilters
    ),
  };

  return source === "search" ? search : contentList;
}

export const NotesFilterSheet = ({
  source = "contentList",
}: {
  source?: NotesFilterSource;
} = {}) => {
  const sheet = useBottomSheet();
  const { openModal } = useModal();
  const {
    filterPersonIds,
    filterFeelings,
    filterLocationIds,
    selectedFolderId,
    setFilterPersonIds,
    setFilterFeelings,
    setFilterLocationIds,
    handleSelectedFolderChange,
    clearAttributeFilters,
  } = useNotesFilterControls(source);

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
      title: filterModalFolderTitle(),
      aboveBottomSheet: true,
      dismissOnBackgroundPress: true,
      customContent: () => (
        <FolderFilterModalContent
          source={source}
          onChange={handleSelectedFolderChange}
        />
      ),
    });
  }, [handleSelectedFolderChange, openModal, source]);

  const openPeoplePicker = useCallback(() => {
    openModal({
      title: filterModalPeopleTitle(),
      aboveBottomSheet: true,
      dismissOnBackgroundPress: true,
      customContent: () => (
        <PeopleFilterModalContent
          source={source}
          onChange={setFilterPersonIds}
        />
      ),
    });
  }, [openModal, setFilterPersonIds, source]);

  const openFeelingPicker = useCallback(() => {
    openModal({
      title: filterModalFeelingTitle(),
      aboveBottomSheet: true,
      dismissOnBackgroundPress: true,
      customContent: () => (
        <FeelingFilterModalContent
          source={source}
          onChange={setFilterFeelings}
        />
      ),
    });
  }, [openModal, setFilterFeelings, source]);

  const openLocationPicker = useCallback(() => {
    openModal({
      title: filterModalLocationTitle(),
      aboveBottomSheet: true,
      dismissOnBackgroundPress: true,
      customContent: () => (
        <LocationFilterModalContent
          source={source}
          onChange={setFilterLocationIds}
        />
      ),
    });
  }, [openModal, setFilterLocationIds, source]);

  const folderSummary = useMemo((): ReactNode => {
    if (!selectedFolderId) {
      return renderFilterSelectedSummary(0);
    }
    const label = allFolders.find(
      (folder) => folder.id === selectedFolderId
    )?.label;
    if (label) return label;
    return <FilterOneSelectedSummary />;
  }, [allFolders, selectedFolderId]);

  const peopleSummary = renderFilterSelectedSummary(filterPersonIds.length);

  const feelingSummary = useMemo((): ReactNode => {
    if (filterFeelings.length === 0) {
      return renderFilterSelectedSummary(0);
    }
    return filterFeelings
      .map(
        (value) =>
          FEELINGS_DEFINITIONS.find((feeling) => feeling.value === value)
            ?.emoji ?? String(value)
      )
      .join(" ");
  }, [filterFeelings]);

  const locationSummary = renderFilterSelectedSummary(filterLocationIds.length);

  return (
    <View className="shrink-0">
      <OptionChip
        icon="funnel"
        label={<FiltersChipLabel activeCount={activeCount} />}
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
                <Typography variant="h3">
                  <FiltersSheetTitle />
                </Typography>
              </View>
            </BottomSheetHeader>

            <FilterRow
              icon="folder"
              label={<FilterFolderLabel />}
              summary={folderSummary}
              onPress={openFolderPicker}
            />
            <FilterRow
              icon="user-round"
              label={<FilterPeopleLabel />}
              summary={peopleSummary}
              onPress={openPeoplePicker}
            />
            <FilterRow
              icon="heart"
              label={<FilterFeelingLabel />}
              summary={feelingSummary}
              onPress={openFeelingPicker}
            />
            <FilterRow
              icon="map-pin"
              label={<FilterLocationLabel />}
              summary={locationSummary}
              onPress={openLocationPicker}
            />

            {hasFilters ? (
              <Button
                variant="outline"
                size="default"
                onPress={clearAttributeFilters}
              >
                <Typography variant="h3">
                  <ClearFiltersLabel />
                </Typography>
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
  label: ReactNode;
  summary: ReactNode;
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
  source,
  onChange,
}: {
  source: NotesFilterSource;
  onChange: (folderId: string | null) => void;
}) {
  const selectedFolderId = useNotesFilterControls(source).selectedFolderId;
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
      searchPlaceholder={filterSearchFoldersPlaceholder()}
      emptyLabel={filterEmptyFoldersLabel()}
    />
  );
}

function PeopleFilterModalContent({
  source,
  onChange,
}: {
  source: NotesFilterSource;
  onChange: (ids: string[]) => void;
}) {
  const selectedIds = useNotesFilterControls(source).filterPersonIds;
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
      searchPlaceholder={filterSearchPeoplePlaceholder()}
      emptyLabel={filterEmptyPeopleLabel()}
    />
  );
}

function FeelingFilterModalContent({
  source,
  onChange,
}: {
  source: NotesFilterSource;
  onChange: (feelings: FeelingValue[]) => void;
}) {
  const selectedFeelings = useNotesFilterControls(source).filterFeelings;
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
      emptyLabel={filterEmptyFeelingsLabel()}
    />
  );
}

function LocationFilterModalContent({
  source,
  onChange,
}: {
  source: NotesFilterSource;
  onChange: (ids: string[]) => void;
}) {
  const selectedIds = useNotesFilterControls(source).filterLocationIds;
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
      searchPlaceholder={filterSearchLocationsPlaceholder()}
      emptyLabel={filterEmptyLocationsLabel()}
    />
  );
}
