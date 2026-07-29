import React, { useEffect, useMemo, useState } from "react";
import { Pressable, ScrollView, TouchableOpacity, View } from "react-native";
import { getFolderIdsFromPath, isFolderPathUnder } from "@repo/sqlite";
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
import { useBottomSheetModal } from "@gorhom/bottom-sheet";
import { useColorScheme } from "@/lib/useColorScheme";
import { Folder } from "@repo/zod-schemas/src/schemas";
import { hsl } from "@/utils/hsl";
import { useControllers } from "@/api/controllers/useControllers";
import { Icon } from "@/components/ui/icons/icon";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { FolderTree } from "@/features/contentList/components/folderTree/folderTree";
import {
  FOLDER_TREE_ROOT_ID,
  FolderSelection,
  filterFoldersExcludingPath,
  isDirectChild,
} from "@/features/contentList/components/folderTree/folderTreeUtils";

export type { FolderSelection };

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
  /** If true, dismiss the hosting bottom sheet after confirm. */
  dismissOnSelect?: boolean;
  /** Prefix for the confirm button, e.g. "Move into" → "Move into Work". */
  actionVerb?: string;
  /**
   * When set, confirm button reads `from "source" to "destination"`
   * instead of `{actionVerb} "destination"`.
   */
  fromLabel?: string | null;
  /** Max characters for folder names on the confirm button. */
  labelMaxChars?: number;
  /**
   * When true, mark `selectedFolder` (or root if null) in the tree with a
   * light map-pin as the item's current location.
   */
  showLocationPin?: boolean;
  /** When false, that destination cannot be chosen (still browsable). */
  isDestinationEnabled?: (folder: FolderSelection) => boolean;
};

const DEFAULT_LABEL_MAX_CHARS = 16;

function truncateFolderLabel(label: string, maxChars: number): string {
  const trimmed = label.trim();
  if (trimmed.length <= maxChars) return trimmed;
  return `${trimmed.slice(0, maxChars)}…`;
}

export const FolderSelector = ({
  onSelect,
  selectedFolder,
  maxChars,
  allowRoot = true,
  error = false,
}: {
  onSelect: (folder: FolderSelection) => void;
  selectedFolder: FolderSelection;
  maxChars?: number;
  /** When false, root cannot be chosen as the destination. */
  allowRoot?: boolean;
  /** Highlights the trigger when folder selection is required. */
  error?: boolean;
}) => {
  const { folders } = useControllers();
  const { data: allFolders } = folders.useFetchAllFoldersQuery();
  const { colorScheme } = useColorScheme();

  const emptyLabel = allowRoot ? "No folder" : "Select a folder";
  const label = selectedFolder?.label ?? emptyLabel;
  const displayName =
    maxChars && label.length > maxChars
      ? `${label.slice(0, maxChars)}…`
      : label;

  const errorBorder = hsl("destructive-foreground", colorScheme);

  return (
    <BottomSheet>
      <BottomSheetOpenTrigger asChild className="self-start">
        <TouchableOpacity
          className="flex-row items-center gap-1.5 px-2 self-start rounded-full bg-card py-1.5"
          style={
            error
              ? {
                  borderWidth: 1.5,
                  borderColor: errorBorder,
                }
              : undefined
          }
        >
          <Icon
            name="folder"
            color={error ? "destructive-foreground" : "foreground"}
            size={16}
          />
          <Typography
            variant="p"
            className={
              error
                ? "shrink text-destructive-foreground"
                : "shrink text-foreground"
            }
            numberOfLines={1}
          >
            {displayName}
          </Typography>
        </TouchableOpacity>
      </BottomSheetOpenTrigger>
      <BottomSheetContent
        style={{ zIndex: 100 }}
        snapPoints={["100%"]}
        enableDynamicSizing={false}
        enablePanDownToClose
        enableContentPanningGesture={false}
      >
        <BottomSheetView className="flex-1 h-full gap-4 pt-4 px-4 pb-6 bg-background">
          <BottomSheetHeader className="bg-background">
            <Typography className="text-foreground text-xl font-bold pb-1">
              Folders
            </Typography>
          </BottomSheetHeader>
          <FolderPickerBrowser
            folders={allFolders ?? []}
            selectedFolder={selectedFolder}
            onSelect={onSelect}
            allowRoot={allowRoot}
            rootLabel={emptyLabel}
            actionVerb="Select"
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
  /** When false, root cannot be chosen as the destination. */
  allowRoot?: boolean;
  onSelect: (folder: FolderSelection) => void;
  sheet: ReturnType<typeof useBottomSheet>;
  active: boolean;
  onDismiss?: () => void;
  isDestinationEnabled?: (folder: FolderSelection) => boolean;
  actionVerb?: string;
  fromLabel?: string | null;
  labelMaxChars?: number;
  showLocationPin?: boolean;
};

/** Imperative bottom sheet hosting the folder browser (for Move actions). */
export const FolderPickerSheet = ({
  title = "Move to…",
  selectedFolder,
  excludePathPrefix,
  rootLabel = "No folder",
  allowRoot = true,
  onSelect,
  sheet,
  active,
  onDismiss,
  isDestinationEnabled,
  actionVerb = "Move into",
  fromLabel,
  labelMaxChars,
  showLocationPin = false,
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
        snapPoints={["100%"]}
        enableDynamicSizing={false}
        enablePanDownToClose
        enableContentPanningGesture={false}
        onDismiss={onDismiss}
      >
        {active ? (
          <BottomSheetView className="flex-1 h-full gap-4 pt-4 px-4 pb-6 bg-background">
            <BottomSheetHeader className="bg-background" onDismiss={onDismiss}>
              <Typography
                className="text-foreground text-xl font-bold pb-1"
                numberOfLines={1}
              >
                {title}
              </Typography>
            </BottomSheetHeader>
            <FolderPickerBrowser
              folders={allFolders ?? []}
              selectedFolder={selectedFolder}
              excludePathPrefix={excludePathPrefix}
              rootLabel={rootLabel}
              allowRoot={allowRoot}
              onSelect={onSelect}
              dismissOnSelect
              actionVerb={actionVerb}
              fromLabel={fromLabel}
              labelMaxChars={labelMaxChars}
              showLocationPin={showLocationPin}
              isDestinationEnabled={isDestinationEnabled}
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
  actionVerb = "Move into",
  fromLabel = null,
  labelMaxChars = DEFAULT_LABEL_MAX_CHARS,
  showLocationPin = false,
  isDestinationEnabled,
}: FolderPickerBrowserProps) {
  const { dismiss } = useBottomSheetModal();
  const { colorScheme } = useColorScheme();

  const foldersById = useMemo(
    () => new Map(folders.map((folder) => [folder.id, folder])),
    [folders]
  );

  const visibleFolders = useMemo(
    () => filterFoldersExcludingPath(folders, excludePathPrefix),
    [excludePathPrefix, folders]
  );

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

  // Keep browse id in sync if the selected folder changes externally.
  useEffect(() => {
    if (!selectedFolder) return;
    if (
      excludePathPrefix &&
      isFolderPathUnder(excludePathPrefix, selectedFolder.path)
    ) {
      return;
    }
    setBrowseFolderId(selectedFolder.id);
  }, [excludePathPrefix, selectedFolder]);

  const childFolders = useMemo(() => {
    const parentPath = browseFolder?.path ?? null;
    return visibleFolders
      .filter((folder) => isDirectChild(parentPath, folder))
      .sort((a, b) => a.label.localeCompare(b.label));
  }, [browseFolder?.path, visibleFolders]);

  const breadcrumbItems = useMemo(() => {
    const root = { id: FOLDER_TREE_ROOT_ID, name: "Root" };
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

  const canSelect = (folder: FolderSelection) =>
    isDestinationEnabled ? isDestinationEnabled(folder) : true;

  const canSelectCurrent = allowRoot || browseFolder != null;
  const destinationEnabled = canSelectCurrent && canSelect(browseFolder);

  const destinationLabel =
    browseFolder?.label ?? (rootLabel === "Move to root" ? "Root" : rootLabel);
  const truncatedDestination = truncateFolderLabel(
    destinationLabel,
    labelMaxChars
  );
  const truncatedFrom = fromLabel
    ? truncateFolderLabel(fromLabel, labelMaxChars)
    : null;

  const handleConfirm = () => {
    if (!destinationEnabled) return;
    onSelect(browseFolder);
    if (dismissOnSelect) dismiss();
  };

  const paneBorder = hsl("border", colorScheme);
  const currentBg = hsl("card", colorScheme);
  const [showContentPanel, setShowContentPanel] = useState(true);

  return (
    <View className="flex-1 gap-3">
      <View
        className="h-10 w-full flex-row items-center overflow-hidden rounded-full shrink-0"
        style={{ backgroundColor: currentBg }}
      >
        <Breadcrumbs
          items={breadcrumbItems}
          onNavigate={(id) =>
            setBrowseFolderId(id === FOLDER_TREE_ROOT_ID ? null : id)
          }
        />
      </View>

      <View className="flex-1 min-h-[280px] overflow-hidden rounded-3xl bg-card">
        <View className="flex-row items-center px-3 py-2 border-b border-border">
          <Typography variant="h5" className="flex-1 opacity-60">
            Location
          </Typography>
          <TouchableOpacity
            onPress={() => setShowContentPanel((prev) => !prev)}
            className="flex-row items-center gap-1.5"
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel={
              showContentPanel ? "Hide content panel" : "Show content panel"
            }
          >
            {showContentPanel ? (
              <Typography variant="h5" className="opacity-60">
                Content
              </Typography>
            ) : null}
            <Icon
              name={showContentPanel ? "panel-right-close" : "panel-right-open"}
              color="foreground"
              size={16}
            />
          </TouchableOpacity>
        </View>

        <View className="flex-1 flex-row">
          <View className="flex-1">
            <FolderTree
              folders={folders}
              selectedFolderId={browseFolderId}
              onSelect={setBrowseFolderId}
              excludePathPrefix={excludePathPrefix}
              rootLabel="Root"
              className="flex-1"
              showLocationPin={showLocationPin}
              locationPinFolderId={selectedFolder?.id ?? null}
            />
          </View>

          {showContentPanel ? (
            <>
              <View
                className="self-stretch"
                style={{ width: 1, backgroundColor: paneBorder }}
              />

              <View className="flex-1">
                <ScrollView
                  nestedScrollEnabled
                  keyboardShouldPersistTaps="handled"
                  contentContainerStyle={{
                    paddingVertical: 4,
                    paddingHorizontal: 4,
                  }}
                >
                  {childFolders.length === 0 ? (
                    <Typography
                      variant="p"
                      className="px-2 py-6 text-muted-foreground text-center"
                    >
                      Empty folder
                    </Typography>
                  ) : (
                    childFolders.map((folder) => (
                      <Pressable
                        key={folder.id}
                        className="flex-row items-center gap-1.5 rounded-lg border border-transparent px-2 py-2"
                        onPress={() => setBrowseFolderId(folder.id)}
                      >
                        <Icon
                          name="folder"
                          color="muted-foreground"
                          size={14}
                        />
                        <Typography className="flex-1" numberOfLines={1}>
                          {folder.label}
                        </Typography>
                        <Icon
                          name="chevron-right"
                          color="muted-foreground"
                          size={14}
                        />
                      </Pressable>
                    ))
                  )}
                </ScrollView>
              </View>
            </>
          ) : null}
        </View>
      </View>

      <Button
        size="lg"
        cornerRadius="full"
        className="w-full"
        disabled={!destinationEnabled}
        onPress={handleConfirm}
        style={{
          backgroundColor: hsl("popover", colorScheme),
          borderColor: paneBorder,
        }}
      >
        <View className="flex-row items-center gap-1.5">
          {truncatedFrom ? (
            <>
              <Typography
                variant="h4"
                style={{ opacity: 0.6 }}
                numberOfLines={1}
              >
                from
              </Typography>
              <Typography
                variant="h4"
                className="font-semibold"
                numberOfLines={1}
              >
                "{truncatedFrom}"
              </Typography>
              <Typography
                variant="h4"
                style={{ opacity: 0.6 }}
                numberOfLines={1}
              >
                to
              </Typography>
              <Typography
                variant="h4"
                className="font-semibold"
                numberOfLines={1}
              >
                "{truncatedDestination}"
              </Typography>
            </>
          ) : (
            <>
              <Typography
                variant="h4"
                style={{ opacity: 0.6 }}
                numberOfLines={1}
              >
                {actionVerb}
              </Typography>
              <Typography
                variant="h4"
                className="font-semibold"
                numberOfLines={1}
              >
                "{truncatedDestination}"
              </Typography>
            </>
          )}
        </View>
      </Button>
    </View>
  );
}
