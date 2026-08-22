import React, { useEffect, useMemo, useState } from "react";
import { Pressable, View } from "react-native";
import { fbs } from "fbtee";
import { canCreateChildFolder, getFolderIdsFromPath } from "@repo/sqlite";
import { Typography } from "@/components/ui";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { CollapsibleContainer } from "@/components/ui/collapsibleContainer";
import { PageOptionsHeaderContainer } from "@/components/layout/page/pageOptionsHeaderContainer";
import {
  BottomSheet,
  BottomSheetContent,
  BottomSheetHeader,
  BottomSheetView,
  useBottomSheet,
} from "@/components/primitives/bottomSheet/bottom-sheet.native";
import { Icon } from "@/components/ui/icons/icon";
import { IconName } from "@/components/ui/icons/icon-registry";
import { useControllers } from "@/api/controllers/useControllers";
import { Check } from "@/lib/icons/Check";
import { cn } from "@/lib/cn";
import { useColorScheme } from "@/lib/useColorScheme";
import { hsl } from "@/utils/hsl";
import {
  DisplayMode,
  FoldersMode,
  OptionsBar as OptionsBarType,
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
  OptionLabelRenderer,
  renderGroupChipLabel,
  renderSortChipLabel,
  SortOptionLabel,
  SortSheetTitle,
} from "./optionsBarLabels";

type OptionItem<T extends string> = {
  value: T;
  icon?: IconName;
};

const SORT_OPTIONS: OptionItem<OptionsBarType["sortBy"]>[] = [
  { icon: "arrow-down-wide-narrow", value: "newest" },
  { icon: "arrow-up-narrow-wide", value: "oldest" },
  { icon: "arrow-down-a-z", value: "az" },
  { icon: "arrow-up-a-z", value: "za" },
];

const GROUP_OPTIONS: OptionItem<OptionsBarType["groupBy"]>[] = [
  { icon: "folder", value: "folders" },
  { icon: "shapes", value: "categories" },
  { icon: "circle-off", value: "none" },
];

type OptionsPickerProps<T extends string> = {
  title: React.ReactNode;
  value: T;
  options: OptionItem<T>[];
  renderOptionLabel: OptionLabelRenderer<T>;
  renderChipLabel: (value: T) => React.ReactNode;
  onValueChange: (value: T) => void;
  largeChip?: boolean;
};

function OptionsSheet<T extends string>({
  title,
  value,
  options,
  renderOptionLabel,
  renderChipLabel,
  onValueChange,
  largeChip = false,
}: OptionsPickerProps<T>) {
  const sheet = useBottomSheet();
  const selected = options.find((option) => option.value === value);
  const selectedIcon = selected?.icon;
  const Chip = largeChip ? TriggerFilterChip : OptionChip;

  return (
    <View className="shrink-0">
      <Chip
        icon={selectedIcon}
        label={renderChipLabel(value)}
        onPress={() => sheet.open()}
      />

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
          <BottomSheetView className="gap-2 bg-background pt-4">
            <BottomSheetHeader
              className="bg-background"
              onDismiss={() => sheet.close()}
            >
              <Typography variant="h3">{title}</Typography>
            </BottomSheetHeader>

            <View className="gap-1 pb-2">
              {options.map((option) => {
                const isSelected = option.value === value;
                return (
                  <Pressable
                    key={option.value}
                    className={cn(
                      "w-full flex-row items-center justify-between gap-2 rounded-lg px-2 py-3",
                      isSelected && "bg-border"
                    )}
                    onPress={() => {
                      onValueChange(option.value);
                      sheet.close();
                    }}
                  >
                    <View className="min-w-0 flex-1 flex-row items-center gap-2">
                      {option.icon ? (
                        <Icon name={option.icon} color="foreground" size={18} />
                      ) : null}
                      <Typography variant="p" className="text-foreground">
                        {renderOptionLabel(option.value)}
                      </Typography>
                    </View>
                    {isSelected ? (
                      <Check className="text-accent-foreground" />
                    ) : null}
                  </Pressable>
                );
              })}
            </View>
          </BottomSheetView>
        </BottomSheetContent>
      </BottomSheet>
    </View>
  );
}

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
  const handleSortByChange = useOptionsBar((state) => state.handleSortByChange);
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

  const [sortBy, setSortBy] = useState(() => useOptionsBar.getState().sortBy);
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

  const onSortByChange = (value: OptionsBarType["sortBy"]) => {
    setSortBy(value);
    handleSortByChange(value);
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
    sortBy !== OPTIONS_BAR_DEFAULTS.sortBy ||
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
                selected={localFoldersMode === "with"}
                onPress={() =>
                  onFoldersModeChange(
                    localFoldersMode === "with" ? "without" : "with"
                  )
                }
              />

              <OptionsSheet
                title={<SortSheetTitle />}
                value={sortBy}
                options={SORT_OPTIONS}
                renderOptionLabel={(value) => <SortOptionLabel value={value} />}
                renderChipLabel={renderSortChipLabel}
                onValueChange={onSortByChange}
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
