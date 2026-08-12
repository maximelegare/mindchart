import React, { useEffect, useMemo, useState } from "react";
import { Pressable, View } from "react-native";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { NotesFilterSheet } from "@/features/contentList/features/notesFilters/components/notesFilterSheet";
import { hasActiveAttributeFilters } from "@/features/contentList/utils/filterNotesByAttributes";

type OptionItem<T extends string> = {
  value: T;
  label: string;
  icon?: IconName;
};

const SORT_OPTIONS: OptionItem<OptionsBarType["sortBy"]>[] = [
  { icon: "arrow-down-wide-narrow", value: "newest", label: "Newest first" },
  { icon: "arrow-up-narrow-wide", value: "oldest", label: "Oldest first" },
  { icon: "arrow-down-a-z", value: "az", label: "Alphabetical" },
  { icon: "arrow-up-a-z", value: "za", label: "Z to A order" },
];

const GROUP_OPTIONS: OptionItem<OptionsBarType["groupBy"]>[] = [
  { icon: "folder", value: "folders", label: "By folder" },
  { icon: "shapes", value: "categories", label: "By category" },
  { icon: "circle-off", value: "none", label: "Not grouping" },
];

const DISPLAY_OPTIONS: OptionItem<DisplayMode>[] = [
  { icon: "notebook-text", value: "notes", label: "Notes" },
  { icon: "layers", value: "categories", label: "Categories" },
];

type OptionsPickerProps<T extends string> = {
  title: string;
  /** Prefix shown on the chip, e.g. "Display:" → "Display: Notes". */
  chipLabelPrefix?: string;
  value: T;
  options: OptionItem<T>[];
  onValueChange: (value: T) => void;
};

function OptionsSheet<T extends string>({
  title,
  chipLabelPrefix,
  value,
  options,
  onValueChange,
}: OptionsPickerProps<T>) {
  const sheet = useBottomSheet();
  const selected = options.find((option) => option.value === value);
  const selectedLabel = selected?.label ?? value;
  const chipLabel = chipLabelPrefix
    ? `${chipLabelPrefix} ${selectedLabel}`
    : selectedLabel;
  const selectedIcon = selected?.icon;

  return (
    <View className="shrink-0">
      <OptionChip
        icon={selectedIcon}
        label={chipLabel}
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
                        {option.label}
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

function OptionsDropdown<T extends string>({
  title,
  chipLabelPrefix,
  value,
  options,
  onValueChange,
}: OptionsPickerProps<T>) {
  const [open, setOpen] = useState(false);
  const selected = options.find((option) => option.value === value);
  const selectedLabel = selected?.label ?? value;
  const chipLabel = chipLabelPrefix
    ? `${chipLabelPrefix} ${selectedLabel}`
    : selectedLabel;
  const selectedIcon = selected?.icon;

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <OptionChip icon={selectedIcon} label={chipLabel} selected={open} />
      </DropdownMenuTrigger>

      <DropdownMenuContent
        side="bottom"
        align="start"
        className=" border border-border bg-popover pb-2 shadow-md"
        style={{ minWidth: 160, marginTop: 8 }}
      >
        <DropdownMenuLabel className="px-3 py-1.5 text-xs text-muted-foreground native:text-sm">
          {title}
        </DropdownMenuLabel>
        <DropdownMenuRadioGroup
          value={value}
          onValueChange={(next) => onValueChange(next as T)}
        >
          {options.map((option) => (
            <DropdownMenuRadioItem
              key={option.value}
              value={option.value}
              className="flex-row items-center gap-2"
            >
              {option.icon ? (
                <Icon name={option.icon} color="popover-foreground" size={16} />
              ) : null}
              <Typography
                variant="p"
                className="text-md text-popover-foreground"
              >
                {option.label}
              </Typography>
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
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
      accessibilityLabel="New folder"
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

  useEffect(() => {
    if (!currentFolderId || !allFolders) return;
    if (!allFolders.some((f) => f.id === currentFolderId)) {
      handleCurrentFolderChange(null);
    }
  }, [allFolders, currentFolderId, handleCurrentFolderChange]);

  const breadcrumbItems = useMemo(() => {
    const root = { id: "root", name: "Root" };
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
  }, [allFolders, currentFolder]);

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
      displayMode !== OPTIONS_BAR_DEFAULTS.displayMode);

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
                label={
                  localFoldersMode === "with"
                    ? "With folders"
                    : "Without folders"
                }
                selected={localFoldersMode === "with"}
                onPress={() =>
                  onFoldersModeChange(
                    localFoldersMode === "with" ? "without" : "with"
                  )
                }
              />

              <OptionsSheet
                title="Sort by"
                value={sortBy}
                options={SORT_OPTIONS}
                onValueChange={onSortByChange}
              />
              <NotesFilterSheet />
              {localFoldersMode === "with" ? <BreadcrumbLinkToggle /> : null}
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
            <OptionsDropdown
              title="Group by"
              chipLabelPrefix={groupBy === "none" ? undefined : "Group"}
              value={groupBy}
              options={GROUP_OPTIONS}
              onValueChange={onGroupByChange}
            />
            <OptionsDropdown
              title="Display"
              chipLabelPrefix="Display"
              value={displayMode}
              options={DISPLAY_OPTIONS}
              onValueChange={onDisplayModeChange}
            />
          </View>
        </View>
      )}
    </PageOptionsHeaderContainer>
  );
};
