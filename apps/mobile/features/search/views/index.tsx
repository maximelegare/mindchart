import React, { useEffect, useState } from "react";
import { Pressable, View } from "react-native";
import { fbs } from "fbtee";
import {
  BottomSheet,
  BottomSheetContent,
  BottomSheetHeader,
  BottomSheetOpenTrigger,
  BottomSheetScrollView,
  useBottomSheet,
} from "@/components/primitives/bottomSheet/bottom-sheet.native";
import { Button } from "@/components/ui";
import { Checkbox } from "@/components/ui/checkbox";
import { Icon } from "@/components/ui/icons/icon";
import { Typography } from "@/components/ui/typography";
import { CollapsibleContainer } from "@/components/ui/collapsibleContainer";
import { OPTIONS_BAR_DEFAULTS } from "@/features/contentList/components/optionsBar/context/optionBarContext";
import { OptionChip } from "@/features/contentList/components/optionsBar/components/options/optionChip";
import { TriggerFilterChip } from "@/features/contentList/components/optionsBar/components/triggerFilterChip";
import {
  OptionsSheet,
  SORT_FIELD_OPTIONS,
} from "@/features/contentList/components/optionsBar/components/optionsSheet";
import {
  renderSortFieldChipLabel,
  SortDirectionChipLabel,
  SortFieldOptionLabel,
  SortSheetTitle,
} from "@/features/contentList/components/optionsBar/components/optionsBarLabels";
import { NotesFilterSheet } from "@/features/contentList/features/notesFilters/components/notesFilterSheet";
import { PageSizeChip } from "@/features/contentList/features/pagination/components/pageSizeChip";
import { DEFAULT_PAGE_SIZE } from "@/features/contentList/features/pagination/constants";
import { hasActiveAttributeFilters } from "@/features/contentList/utils/filterNotesByAttributes";
import { SearchResultsList } from "../features/searchResults/components/searchResultsList";
import { useSearch } from "../hooks/useSearch";
import { ConventionalSearch } from "../features/conventionalSearch/search";
import { useSearchContext } from "../context/search";
import { searchPageTitle, searchTranscriptToggleLabel } from "../searchLabels";
import { router } from "expo-router";

export const SearchFeature = () => {
  const {
    query,
    setQuery,
    includeTranscript,
    setIncludeTranscript,
    page,
    setPage,
    pageSize,
    setPageSize,
    sortField,
    setSortField,
    sortDirection,
    toggleSortDirection,
    selectedFolderId,
    filterPersonIds,
    filterFeelings,
    filterLocationIds,
  } = useSearchContext();
  const { items, totalCount, pageCount, isFetching, isEmptyQuery } =
    useSearch();
  const pendingNoteId = useSearchContext((state) => state.pendingNoteId);
  const searchSheet = useBottomSheet();
  const [optionsExpanded, setOptionsExpanded] = useState(false);

  useEffect(() => {
    if (!pendingNoteId) return;
    setOptionsExpanded(false);
    searchSheet.close();
  }, [pendingNoteId, searchSheet.close]);

  const hasAttributeFilters =
    hasActiveAttributeFilters({
      personIds: filterPersonIds,
      feelings: filterFeelings,
      locationIds: filterLocationIds,
    }) || selectedFolderId != null;

  const hasNonDefaultOptions =
    includeTranscript ||
    hasAttributeFilters ||
    sortField !== OPTIONS_BAR_DEFAULTS.sortField ||
    sortDirection !== OPTIONS_BAR_DEFAULTS.sortDirection ||
    pageSize !== DEFAULT_PAGE_SIZE;

  const openPendingNote = () => {
    const id = useSearchContext.getState().consumePendingNoteId();
    if (!id) return;
    router.push({ pathname: "/notes/[id]", params: { id } });
  };

  return (
    <BottomSheet>
      <BottomSheetOpenTrigger asChild>
        <Button variant="ghost" size="icon">
          <Icon name="search" size={24} color="popover-foreground" />
        </Button>
      </BottomSheetOpenTrigger>
      <BottomSheetContent
        ref={searchSheet.ref}
        snapPoints={["100%"]}
        style={{ zIndex: 100 }}
        enableDynamicSizing={false}
        enableContentPanningGesture={false}
        onDismiss={openPendingNote}
      >
        <View className="bg-background pt-6">
          <BottomSheetHeader className="bg-background w-full">
            <Typography variant="h3" padding={false}>
              {searchPageTitle()}
            </Typography>
          </BottomSheetHeader>
          <View className="px-4 pt-3 pb-3">
            <View
              className="w-full flex-row items-center gap-3"
              style={{ minHeight: 48 }}
            >
              <View className="h-12 shrink-0 items-center justify-center">
                <TriggerFilterChip
                  icon="settings-2"
                  selected={optionsExpanded}
                  showDot={hasNonDefaultOptions}
                  onPress={() => setOptionsExpanded((prev) => !prev)}
                />
              </View>
              <ConventionalSearch onSearch={setQuery} />
            </View>
            <CollapsibleContainer expanded={optionsExpanded}>
              {optionsExpanded ? (
                <>
                  <View
                    className="flex-row flex-wrap items-center py-3"
                    style={{ rowGap: 12, columnGap: 8 }}
                  >
                    <OptionChip
                      icon={
                        sortDirection === "asc"
                          ? "arrow-down-wide-narrow"
                          : "arrow-up-narrow-wide"
                      }
                      label={<SortDirectionChipLabel value={sortDirection} />}
                      unstyledLabel
                      onPress={toggleSortDirection}
                      accessibilityLabel={
                        sortDirection === "asc"
                          ? fbs(
                              "Sort from beginning to end",
                              "Accessibility label for ascending sort direction"
                            )
                          : fbs(
                              "Sort from end to beginning",
                              "Accessibility label for descending sort direction"
                            )
                      }
                    />
                    <OptionsSheet
                      title={<SortSheetTitle />}
                      value={sortField}
                      options={SORT_FIELD_OPTIONS}
                      renderOptionLabel={(value) => (
                        <SortFieldOptionLabel value={value} />
                      )}
                      renderChipLabel={renderSortFieldChipLabel}
                      onValueChange={setSortField}
                    />
                    <NotesFilterSheet source="search" />
                    <PageSizeChip
                      pageSize={pageSize}
                      setPageSize={setPageSize}
                    />
                  </View>
                  <View className="flex-row items-center gap-3 pb-3">
                    <Checkbox
                      checked={includeTranscript}
                      onCheckedChange={setIncludeTranscript}
                      accessibilityLabel={String(searchTranscriptToggleLabel())}
                    />
                    <Pressable
                      className="flex-1"
                      onPress={() => setIncludeTranscript(!includeTranscript)}
                    >
                      <Typography variant="p" padding={false}>
                        {searchTranscriptToggleLabel()}
                      </Typography>
                    </Pressable>
                  </View>
                </>
              ) : null}
            </CollapsibleContainer>
          </View>
        </View>
        <BottomSheetScrollView className="flex-1 bg-background px-4">
          {isEmptyQuery ? null : (
            <SearchResultsList
              query={query}
              data={items}
              totalCount={totalCount}
              page={page}
              pageCount={pageCount}
              onPageChange={setPage}
              isFetching={isFetching}
            />
          )}
        </BottomSheetScrollView>
      </BottomSheetContent>
    </BottomSheet>
  );
};
