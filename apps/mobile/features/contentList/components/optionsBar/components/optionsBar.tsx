import React, { useEffect, useMemo, useState } from "react";
import { Pressable, View } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { getFolderIdsFromPath } from "@repo/sqlite";
import { Typography } from "@/components/ui";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { CollapsibleContainer } from "@/components/ui/collapsibleContainer";
import { PageOptionsHeaderContainer } from "@/components/layout/page/pageOptionsHeaderContainer";
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
import { useFolderActions } from "../hooks/useFolderActions";
import { ContentListFilterChips } from "./filters/filterChips";
import { FolderBreadcrumbCrumb } from "./folders/folderActionsMenu";
import { TriggerFilterChip } from "./triggerFilterChip";
import { OptionChip } from "./options/optionChip";
import { Gutter } from "@/components/ui/gutter";

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
  { icon: "circle-off", value: "none", label: "None" },
];

const DISPLAY_OPTIONS: OptionItem<DisplayMode>[] = [
  { icon: "notebook-text", value: "notes", label: "Notes" },
  { icon: "layers", value: "categories", label: "Categories" },
];

type OptionsDropdownProps<T extends string> = {
  title: string;
  value: T;
  options: OptionItem<T>[];
  onValueChange: (value: T) => void;
};

function OptionsDropdown<T extends string>({
  title,
  value,
  options,
  onValueChange,
}: OptionsDropdownProps<T>) {
  const [open, setOpen] = useState(false);
  const selected = options.find((option) => option.value === value);
  const selectedLabel = selected?.label ?? value;
  const selectedIcon = selected?.icon;

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <OptionChip icon={selectedIcon} label={selectedLabel} selected={open} />
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

function NewFolderButton({ onPress }: { onPress: () => void }) {
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
  const currentFolderId = useOptionsBar((state) => state.currentFolderId);
  const handleCurrentFolderChange = useOptionsBar(
    (state) => state.handleCurrentFolderChange
  );
  const foldersMode = useOptionsBar((state) => state.foldersMode);
  const showFolders = foldersMode === "with";

  const [sortBy, setSortBy] = useState(() => useOptionsBar.getState().sortBy);
  const [groupBy, setGroupBy] = useState(
    () => useOptionsBar.getState().groupBy
  );
  const [displayMode, setDisplayMode] = useState(
    () => useOptionsBar.getState().displayMode
  );
  const [localFoldersMode, setLocalFoldersMode] = useState(
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

  const hasNonDefaultOptions =
    sortBy !== OPTIONS_BAR_DEFAULTS.sortBy ||
    groupBy !== OPTIONS_BAR_DEFAULTS.groupBy ||
    displayMode !== OPTIONS_BAR_DEFAULTS.displayMode ||
    localFoldersMode !== OPTIONS_BAR_DEFAULTS.foldersMode;

  const settingsToggle = (
    <TriggerFilterChip
      icon="settings-2"
      selected={expanded}
      showDot={hasNonDefaultOptions}
      onPress={() => setExpanded((prev) => !prev)}
    />
  );

  return (
    <PageOptionsHeaderContainer
      footer={
        <CollapsibleContainer expanded={expanded}>
          <Gutter size="md" className="mb-2">
            <ScrollView
              horizontal
              nestedScrollEnabled
              keyboardShouldPersistTaps="handled"
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{
                flexDirection: "row",
                alignItems: "center",
                gap: 8,
                paddingVertical: 6,
              }}
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
              <OptionsDropdown
                title="Sort by:"
                value={sortBy}
                options={SORT_OPTIONS}
                onValueChange={onSortByChange}
              />
              <OptionsDropdown
                title="Display:"
                value={displayMode}
                options={DISPLAY_OPTIONS}
                onValueChange={onDisplayModeChange}
              />
              {localFoldersMode === "without" ? (
                <OptionsDropdown
                  title="Group by:"
                  value={groupBy}
                  options={GROUP_OPTIONS}
                  onValueChange={onGroupByChange}
                />
              ) : null}
            </ScrollView>
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
          <NewFolderButton onPress={onCreateFolder} />
        </View>
      ) : (
        <ContentListFilterChips leading={settingsToggle} />
      )}
    </PageOptionsHeaderContainer>
  );
};
