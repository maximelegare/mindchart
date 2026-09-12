import React, { useEffect, useMemo, useState } from "react";
import { Pressable, View } from "react-native";
import { fbs } from "fbtee";
import { canCreateChildFolder, getFolderIdsFromPath } from "@repo/sqlite";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { CollapsibleContainer } from "@/components/ui/collapsibleContainer";
import { PageOptionsHeaderContainer } from "@/components/layout/page/pageOptionsHeaderContainer";
import { Icon } from "@/components/ui/icons/icon";
import { useControllers } from "@/api/controllers/useControllers";
import { useColorScheme } from "@/lib/useColorScheme";
import { hsl } from "@/utils/hsl";
import {
  DisplayMode,
  FoldersMode,
  OptionsBar as OptionsBarType,
  SortField,
} from "../../../types";
import {
  OPTIONS_BAR_DEFAULTS,
  useOptionsBar,
} from "../context/optionBarContext";
import { useFolderActions } from "../../../features/folderContents/hooks/useFolderActions";
import { FolderBreadcrumbCrumb } from "../../../features/folderContents/components/folderActionsMenu";
import { TriggerFilterChip } from "./triggerFilterChip";
import { OptionChip } from "./options/optionChip";
import { Gutter } from "@/components/ui/gutter";
import { BreadcrumbLinkToggle } from "@/features/navigation/breadcrumbLinkToggle";
import { folderBreadcrumbRootLabel } from "@/features/notes/shared/ui/folderPickerLabels";
import { NotesFilterSheet } from "@/features/contentList/features/notesFilters/components/notesFilterSheet";
import { hasActiveAttributeFilters } from "@/features/contentList/utils/filterNotesByAttributes";
import { PageSizeChip } from "@/features/contentList/features/pagination/components/pageSizeChip";
import {
  DisplayModeChipLabel,
  FoldersModeChipLabel,
  GroupOptionLabel,
  GroupSheetTitle,
  renderGroupChipLabel,
  renderSortFieldChipLabel,
  SortDirectionChipLabel,
  SortFieldOptionLabel,
  SortSheetTitle,
} from "./optionsBarLabels";
import {
  OptionsSheet,
  SORT_FIELD_OPTIONS,
  type OptionItem,
} from "./optionsSheet";

const GROUP_OPTIONS: OptionItem<OptionsBarType["groupBy"]>[] = [
  { icon: "folder", value: "folders" },
  { icon: "shapes", value: "categories" },
  { icon: "calendar", value: "dates" },
  { icon: "circle-off", value: "none" },
];

export function NewFolderButton({ onPress }: { onPress: () => void }) {
  const { colorScheme } = useColorScheme();
  const backgroundColor = hsl("card", colorScheme);
  const borderColor = hsl("card", colorScheme);

  return (
    <Pressable
      onPress={onPress}
      className="min-w-10 shrink-0 flex-row items-center gap-1.5 rounded-full border px-3 py-2"
      style={{ backgroundColor, borderColor }}
      accessibilityRole="button"
      accessibilityLabel={fbs(
        "New folder",
        "Accessibility label for new folder button"
      )}
    >
      <Icon name="folder" color="muted-foreground" size={16} />
      <Icon name="plus" color="muted-foreground" size={14} />
    </Pressable>
  );
}

function BreadcrumbsSurface({ children }: { children: React.ReactNode }) {
  const { colorScheme } = useColorScheme();
  const backgroundColor = hsl("card", colorScheme);

  return (
    <View
      className="min-w-0 overflow-hidden flex-1 flex-row items-center rounded-full"
      style={{ backgroundColor }}
    >
      {children}
    </View>
  );
}

export const OptionsBar = () => {
  const [expanded, setExpanded] = useState(false);
  const handleSortFieldChange = useOptionsBar(
    (state) => state.handleSortFieldChange
  );
  const toggleSortDirection = useOptionsBar(
    (state) => state.toggleSortDirection
  );
  const handleGroupByChange = useOptionsBar(
    (state) => state.handleGroupByChange
  );
  const handleDisplayModeChange = useOptionsBar(
    (state) => state.handleDisplayModeChange
  );
  const handleFoldersModeChange = useOptionsBar(
    (state) => state.handleFoldersModeChange
  );
  const folderTreeSidebarOpen = useOptionsBar(
    (state) => state.folderTreeSidebarOpen
  );
  const toggleFolderTreeSidebar = useOptionsBar(
    (state) => state.toggleFolderTreeSidebar
  );
  const currentFolderId = useOptionsBar((state) => state.currentFolderId);
  const handleCurrentFolderChange = useOptionsBar(
    (state) => state.handleCurrentFolderChange
  );
  const foldersMode = useOptionsBar((state) => state.foldersMode);
  const showFolders = foldersMode === "with";
  const filterPersonIds = useOptionsBar((state) => state.filterPersonIds);
  const filterFeelings = useOptionsBar((state) => state.filterFeelings);
  const filterLocationIds = useOptionsBar((state) => state.filterLocationIds);
  const selectedFolderId = useOptionsBar((state) => state.selectedFolderId);

  const [sortField, setSortField] = useState(
    () => useOptionsBar.getState().sortField
  );
  const [sortDirection, setSortDirection] = useState(
    () => useOptionsBar.getState().sortDirection
  );
  const [groupBy, setGroupBy] = useState(
    () => useOptionsBar.getState().groupBy
  );
  const [displayMode, setDisplayMode] = useState(
    () => useOptionsBar.getState().displayMode
  );
  const [localFoldersMode, setLocalFoldersMode] = useState<FoldersMode>(
    () => useOptionsBar.getState().foldersMode
  );

  const { folders } = useControllers();
  const { data: allFolders = [] } = folders.useFetchAllFoldersQuery({
    enabled: showFolders,
  });
  const { openCreateFolderModal } = useFolderActions();

  const currentFolder = useMemo(
    () => allFolders?.find((f) => f.id === currentFolderId) ?? null,
    [allFolders, currentFolderId]
  );

  const breadcrumbRootLabel = folderBreadcrumbRootLabel();

  useEffect(() => {
    if (!currentFolderId || !allFolders) return;
    if (!allFolders.some((f) => f.id === currentFolderId)) {
      handleCurrentFolderChange(null);
    }
  }, [allFolders, currentFolderId, handleCurrentFolderChange]);

  const breadcrumbItems = useMemo(() => {
    const root = { id: "root", name: breadcrumbRootLabel };
    if (!currentFolder) return [root];

    const ids = getFolderIdsFromPath(currentFolder.path);
    const byId = new Map((allFolders ?? []).map((f) => [f.id, f]));
    return [
      root,
      ...ids.map((id) => ({
        id,
        name: byId.get(id)?.label ?? id,
      })),
    ];
  }, [allFolders, breadcrumbRootLabel, currentFolder]);

  const foldersById = useMemo(
    () => new Map((allFolders ?? []).map((f) => [f.id, f])),
    [allFolders]
  );

  const onNavigateFolder = (id: string) => {
    handleCurrentFolderChange(id === "root" ? null : id);
  };

  const onCreateFolder = () => {
    openCreateFolderModal(
      currentFolder
        ? { kind: "folder", folder: currentFolder }
        : { kind: "root" }
    );
  };

  const onSortFieldChange = (value: SortField) => {
    setSortField(value);
    handleSortFieldChange(value);
  };

  const onSortDirectionToggle = () => {
    const next = sortDirection === "asc" ? "desc" : "asc";
    setSortDirection(next);
    toggleSortDirection();
  };

  const onGroupByChange = (value: OptionsBarType["groupBy"]) => {
    setGroupBy(value);
    handleGroupByChange(value);
    if (value !== "none") {
      setDisplayMode("notes");
    }
  };

  const onDisplayModeChange = (value: DisplayMode) => {
    setDisplayMode(value);
    handleDisplayModeChange(value);
  };

  const onFoldersModeChange = (value: FoldersMode) => {
    setLocalFoldersMode(value);
    handleFoldersModeChange(value);
  };

  const hasAttributeFilters =
    hasActiveAttributeFilters({
      personIds: filterPersonIds,
      feelings: filterFeelings,
      locationIds: filterLocationIds,
    }) || selectedFolderId != null;

  const hasNonDefaultWithoutFolderOptions =
    localFoldersMode === "without" &&
    (groupBy !== OPTIONS_BAR_DEFAULTS.groupBy ||
      displayMode !== OPTIONS_BAR_DEFAULTS.displayMode ||
      useOptionsBar.getState().pageSize !== OPTIONS_BAR_DEFAULTS.pageSize);

  const hasNonDefaultOptions =
    sortField !== OPTIONS_BAR_DEFAULTS.sortField ||
    sortDirection !== OPTIONS_BAR_DEFAULTS.sortDirection ||
    localFoldersMode !== OPTIONS_BAR_DEFAULTS.foldersMode ||
    hasAttributeFilters ||
    hasNonDefaultWithoutFolderOptions;

  const settingsToggle = (
    <TriggerFilterChip
      icon="settings-2"
      selected={expanded}
      showDot={hasNonDefaultOptions}
      onPress={() => setExpanded((prev) => !prev)}
    />
  );

  const folderTreeToggle = (
    <TriggerFilterChip
      icon="folder-tree"
      selected={folderTreeSidebarOpen}
      onPress={toggleFolderTreeSidebar}
    />
  );

  return (
    <PageOptionsHeaderContainer
      footer={
        <CollapsibleContainer expanded={expanded}>
          <Gutter size="md" className="mb-2">
            <View
              className="flex-row flex-wrap items-center py-3"
              style={{ rowGap: 12, columnGap: 8 }}
            >
              <OptionChip
                icon="folder"
                label={<FoldersModeChipLabel mode={localFoldersMode} />}
                selected
                onPress={() =>
                  onFoldersModeChange(
                    localFoldersMode === "with" ? "without" : "with"
                  )
                }
              />

              <OptionChip
                icon={
                  sortDirection === "asc"
                    ? "arrow-down-wide-narrow"
                    : "arrow-up-narrow-wide"
                }
                label={<SortDirectionChipLabel value={sortDirection} />}
                unstyledLabel
                selected
                onPress={onSortDirectionToggle}
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
                onValueChange={onSortFieldChange}
                selected
              />
              <NotesFilterSheet />
              {localFoldersMode === "with" ? <BreadcrumbLinkToggle /> : null}
              {displayMode === "notes" && localFoldersMode === "without" ? (
                <PageSizeChip />
              ) : null}
            </View>
          </Gutter>
        </CollapsibleContainer>
      }
    >
      {showFolders ? (
        <View className="h-full w-full flex-row items-center gap-2">
          <View className="shrink-0">{settingsToggle}</View>

          <BreadcrumbsSurface>
            <Breadcrumbs
              items={breadcrumbItems}
              onNavigate={onNavigateFolder}
              renderItem={({ item, isLast }) => (
                <FolderBreadcrumbCrumb
                  item={item}
                  isLast={isLast}
                  folder={
                    item.id === "root"
                      ? null
                      : (foldersById.get(item.id) ?? null)
                  }
                  onNavigate={onNavigateFolder}
                />
              )}
            />
          </BreadcrumbsSurface>
          {canCreateChildFolder(currentFolder?.path ?? null) ? (
            <NewFolderButton onPress={onCreateFolder} />
          ) : null}
          <View className="shrink-0">{folderTreeToggle}</View>
        </View>
      ) : (
        <View className="h-full w-full flex-row items-center gap-2">
          <View className="shrink-0">{settingsToggle}</View>
          <View className="min-w-0 flex-1 flex-row flex-wrap items-center gap-2">
            <OptionsSheet
              title={<GroupSheetTitle />}
              value={groupBy}
              options={GROUP_OPTIONS}
              renderOptionLabel={(value) => <GroupOptionLabel value={value} />}
              renderChipLabel={(value) =>
                renderGroupChipLabel(value, groupBy !== "none")
              }
              onValueChange={onGroupByChange}
              largeChip
            />
            <TriggerFilterChip
              icon={displayMode === "notes" ? "notebook-text" : "shapes"}
              label={<DisplayModeChipLabel mode={displayMode} />}
              onPress={() =>
                onDisplayModeChange(
                  displayMode === "notes" ? "categories" : "notes"
                )
              }
            />
          </View>
        </View>
      )}
    </PageOptionsHeaderContainer>
  );
};
