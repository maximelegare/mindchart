import React, { useState } from "react";
import { Pressable, View } from "react-native";
import {
  BottomSheet,
  BottomSheetContent,
  BottomSheetHeader,
  BottomSheetOpenTrigger,
  BottomSheetScrollView,
} from "@/components/primitives/bottomSheet/bottom-sheet.native";
import { Button } from "@/components/ui";
import { Checkbox } from "@/components/ui/checkbox";
import { Icon } from "@/components/ui/icons/icon";
import { Typography } from "@/components/ui/typography";
import { CollapsibleContainer } from "@/components/ui/collapsibleContainer";
import { TriggerFilterChip } from "@/features/contentList/components/optionsBar/components/triggerFilterChip";
import { SearchResultsList } from "../features/searchResults/components/searchResultsList";
import { useSearch } from "../hooks/useSearch";
import { ConventionalSearch } from "../features/conventionalSearch/search";
import { useSearchContext } from "../context/search";
import {
  searchOptionsAccessibilityLabel,
  searchPageTitle,
  searchTranscriptToggleLabel,
} from "../searchLabels";
import { router } from "expo-router";

export const SearchFeature = () => {
  const {
    query,
    setQuery,
    includeTranscript,
    setIncludeTranscript,
    page,
    setPage,
  } = useSearchContext();
  const { items, totalCount, pageCount, isFetching, isEmptyQuery } =
    useSearch();
  const [optionsExpanded, setOptionsExpanded] = useState(false);

  const openPendingNote = () => {
    const id = useSearchContext.getState().consumePendingNoteId();
    if (!id) return;
    setTimeout(() => {
      router.push({ pathname: "/notes/[id]", params: { id } });
    }, 100);
  };

  return (
    <BottomSheet>
      <BottomSheetOpenTrigger asChild>
        <Button variant="ghost" size="icon">
          <Icon name="search" size={24} color="popover-foreground" />
        </Button>
      </BottomSheetOpenTrigger>
      <BottomSheetContent
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
                  showDot={includeTranscript}
                  onPress={() => setOptionsExpanded((prev) => !prev)}
                  accessibilityLabel={String(searchOptionsAccessibilityLabel())}
                />
              </View>
              <ConventionalSearch onSearch={setQuery} />
            </View>
            <CollapsibleContainer expanded={optionsExpanded}>
              <View className="flex-row items-center gap-3 py-3">
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
