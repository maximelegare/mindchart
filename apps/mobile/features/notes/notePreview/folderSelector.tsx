import React, { useMemo, useState } from "react";
import { Pressable, ScrollView, TouchableOpacity, View } from "react-native";
import {
  getFolderIdsFromPath,
  getParentFolderPath,
  isFolderPathUnder,
} from "@repo/sqlite";
import {
  BottomSheet,
  BottomSheetContent,
  BottomSheetHeader,
  BottomSheetOpenTrigger,
  BottomSheetView,
  useBottomSheet,
} from "@/components/primitives/bottomSheet/bottom-sheet.native";
import { Typography } from "@/components/ui";
import { Button } from "@/components/ui/button";
import { Check } from "@/lib/icons/Check";
import { useBottomSheetModal } from "@gorhom/bottom-sheet";
import { useColorScheme } from "@/lib/useColorScheme";
import { Folder } from "@repo/zod-schemas/src/schemas";
import { hsl } from "@/utils/hsl";
import { useControllers } from "@/api/controllers/useControllers";
import { Icon } from "@/components/ui/icons/icon";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";

export type FolderSelection = Folder | null;

const isDirectChild = (parentPath: string | null, folder: Folder) => {
  if (parentPath === null) {
    return getParentFolderPath(folder.path) === null;
  }
  return getParentFolderPath(folder.path) === parentPath;
};

export type FolderPickerBrowserProps = {
  folders: Folder[];
  selectedFolder: FolderSelection;
  onSelect: (folder: FolderSelection) => void;
  /** Hide this path and its descendants (e.g. folder being moved). */
  excludePathPrefix?: string | null;
  /** Label for the root / clear option. */
  rootLabel?: string;
  /** When false, root selection is hidden (unused today; kept for flexibility). */
  allowRoot?: boolean;
  /** If true, dismiss the hosting bottom sheet after select. */
  dismissOnSelect?: boolean;
};

export const FolderSelector = ({
  onSelect,
  selectedFolder,
  maxChars,
}: {
  onSelect: (folder: FolderSelection) => void;
  selectedFolder: FolderSelection;
  maxChars?: number;
}) => {
  const { folders } = useControllers();
  const { data: allFolders } = folders.useFetchAllFoldersQuery();

  const label = selectedFolder?.label ?? "No folder";
  const displayName =
    maxChars && label.length > maxChars
      ? `${label.slice(0, maxChars)}…`
      : label;

  return (
    <BottomSheet>
      <BottomSheetOpenTrigger asChild className="self-start">
        <TouchableOpacity className="flex-row items-center gap-1.5 self-start rounded-full bg-card px-2.5 py-1.5">
          <Icon name="folder" color="foreground" size={16} />
          <Typography
            variant="p"
            className="shrink text-foreground"
            numberOfLines={1}
          >
            {displayName}
          </Typography>
        </TouchableOpacity>
      </BottomSheetOpenTrigger>
      <BottomSheetContent
        style={{ zIndex: 100 }}
        enablePanDownToClose
        enableContentPanningGesture={false}
      >
        <BottomSheetView
          className="gap-4 pt-6 bg-background"
          style={{ left: 19 }}
        >
          <BottomSheetHeader className="bg-background">
            <Typography className="text-foreground text-xl font-bold pb-1">
              Folders
            </Typography>
          </BottomSheetHeader>
          <FolderPickerBrowser
            folders={allFolders ?? []}
            selectedFolder={selectedFolder}
            onSelect={onSelect}
          />
        </BottomSheetView>
      </BottomSheetContent>
    </BottomSheet>
  );
};

type FolderPickerSheetProps = {
  title?: string;
  selectedFolder: FolderSelection;
  excludePathPrefix?: string | null;
  rootLabel?: string;
  onSelect: (folder: FolderSelection) => void;
  sheet: ReturnType<typeof useBottomSheet>;
  active: boolean;
  onDismiss?: () => void;
};

/** Imperative bottom sheet hosting the folder browser (for Move actions). */
export const FolderPickerSheet = ({
  title = "Move to…",
  selectedFolder,
  excludePathPrefix,
  rootLabel = "No folder",
  onSelect,
  sheet,
  active,
  onDismiss,
}: FolderPickerSheetProps) => {
  const { folders } = useControllers();
  const { data: allFolders } = folders.useFetchAllFoldersQuery({
    enabled: active,
  });

  return (
    <BottomSheet>
      <BottomSheetContent
        ref={sheet.ref}
        style={{ zIndex: 100 }}
        enablePanDownToClose
        enableContentPanningGesture={false}
        onDismiss={onDismiss}
      >
        {active ? (
          <BottomSheetView
            className="gap-4 pt-6 bg-background"
            style={{ left: 19 }}
          >
            <BottomSheetHeader className="bg-background" onDismiss={onDismiss}>
              <Typography className="text-foreground text-xl font-bold pb-1">
                {title}
              </Typography>
            </BottomSheetHeader>
            <FolderPickerBrowser
              folders={allFolders ?? []}
              selectedFolder={selectedFolder}
              excludePathPrefix={excludePathPrefix}
              rootLabel={rootLabel}
              onSelect={onSelect}
              dismissOnSelect
            />
          </BottomSheetView>
        ) : null}
      </BottomSheetContent>
    </BottomSheet>
  );
};

export function FolderPickerBrowser({
  folders,
  selectedFolder,
  onSelect,
  excludePathPrefix = null,
  rootLabel = "No folder",
  allowRoot = true,
  dismissOnSelect = true,
}: FolderPickerBrowserProps) {
  const { dismiss } = useBottomSheetModal();
  const { colorScheme } = useColorScheme();
  const foldersById = useMemo(
    () => new Map(folders.map((folder) => [folder.id, folder])),
    [folders]
  );

  const visibleFolders = useMemo(() => {
    if (!excludePathPrefix) return folders;
    return folders.filter(
      (folder) => !isFolderPathUnder(excludePathPrefix, folder.path)
    );
  }, [excludePathPrefix, folders]);

  // Start browsing at the selected folder (or root), unless excluded.
  const [browseFolderId, setBrowseFolderId] = useState<string | null>(() => {
    if (!selectedFolder) return null;
    if (
      excludePathPrefix &&
      isFolderPathUnder(excludePathPrefix, selectedFolder.path)
    ) {
      return null;
    }
    return selectedFolder.id;
  });

  const browseFolder = browseFolderId
    ? (foldersById.get(browseFolderId) ?? null)
    : null;

  const childFolders = useMemo(() => {
    const parentPath = browseFolder?.path ?? null;
    return visibleFolders
      .filter((folder) => isDirectChild(parentPath, folder))
      .sort((a, b) => a.label.localeCompare(b.label));
  }, [browseFolder?.path, visibleFolders]);

  const breadcrumbItems = useMemo(() => {
    const root = { id: "root", name: "Root" };
    if (!browseFolder) return [root];
    const ids = getFolderIdsFromPath(browseFolder.path).filter((id) => {
      const folder = foldersById.get(id);
      if (!folder || !excludePathPrefix) return true;
      return !isFolderPathUnder(excludePathPrefix, folder.path);
    });
    return [
      root,
      ...ids.map((id) => ({
        id,
        name: foldersById.get(id)?.label ?? id,
      })),
    ];
  }, [browseFolder, excludePathPrefix, foldersById]);

  const handleSelect = (folder: FolderSelection) => {
    onSelect(folder);
    if (dismissOnSelect) dismiss();
  };

  const isCurrentSelected =
    browseFolder === null
      ? selectedFolder === null
      : selectedFolder?.id === browseFolder.id;

  return (
    <View className="gap-3">
      <Breadcrumbs
        items={breadcrumbItems}
        onNavigate={(id) => setBrowseFolderId(id === "root" ? null : id)}
        className="rounded-full bg-card px-1"
      />

      {allowRoot || browseFolder ? (
        <Pressable
          className="py-3 px-3 w-full rounded-lg border border-solid flex-row items-center justify-between"
          style={{
            borderColor: isCurrentSelected
              ? hsl("border", colorScheme)
              : hsl("card", colorScheme),
            backgroundColor: hsl("card", colorScheme),
          }}
          onPress={() => handleSelect(browseFolder)}
        >
          <View className="flex-row items-center gap-2 flex-1">
            <Icon
              name={browseFolder ? "folder" : "circle-off"}
              color="muted-foreground"
              size={16}
            />
            <Typography>
              {browseFolder ? `Select “${browseFolder.label}”` : rootLabel}
            </Typography>
          </View>
          {isCurrentSelected ? (
            <Check className="text-accent-foreground" />
          ) : null}
        </Pressable>
      ) : null}

      <ScrollView style={{ maxHeight: 260 }}>
        <View className="flex flex-col w-full gap-1">
          {childFolders.length === 0 ? (
            <Typography
              variant="p"
              className="px-2 py-4 text-muted-foreground text-center"
            >
              No subfolders
            </Typography>
          ) : (
            childFolders.map((folder) => (
              <FolderNavRow
                key={folder.id}
                folder={folder}
                selected={selectedFolder?.id === folder.id}
                onOpen={() => setBrowseFolderId(folder.id)}
                onSelect={() => handleSelect(folder)}
              />
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
}

function FolderNavRow({
  folder,
  selected,
  onOpen,
  onSelect,
}: {
  folder: Folder;
  selected: boolean;
  onOpen: () => void;
  onSelect: () => void;
}) {
  const { colorScheme } = useColorScheme();

  return (
    <View
      className="flex-row items-center rounded-lg border border-solid"
      style={{
        borderColor: selected ? hsl("border", colorScheme) : "transparent",
      }}
    >
      <Pressable
        className="flex-1 flex-row items-center gap-2 py-3.5 px-2"
        onPress={onOpen}
      >
        <Icon name="folder" color="muted-foreground" size={16} />
        <Typography className="flex-1" numberOfLines={1}>
          {folder.label}
        </Typography>
        <Icon name="chevron-right" color="muted-foreground" size={16} />
      </Pressable>
      <Button
        variant="ghost"
        size="xs"
        className="mr-1"
        onPress={onSelect}
        accessibilityLabel={`Select ${folder.label}`}
      >
        {selected ? (
          <Check className="text-accent-foreground" />
        ) : (
          <Typography className="text-xs text-muted-foreground">Use</Typography>
        )}
      </Button>
    </View>
  );
}
