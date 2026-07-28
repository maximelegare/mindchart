import React, { useEffect, useMemo, useState } from "react";
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
import { useBottomSheetModal } from "@gorhom/bottom-sheet";
import { useColorScheme } from "@/lib/useColorScheme";
import { Folder } from "@repo/zod-schemas/src/schemas";
import { hsl } from "@/utils/hsl";
import { useControllers } from "@/api/controllers/useControllers";
import { Icon } from "@/components/ui/icons/icon";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { cn } from "@/lib/cn";

export type FolderSelection = Folder | null;

const ROOT_ID = "root";

const isDirectChild = (parentPath: string | null, folder: Folder) => {
  if (parentPath === null) {
    return getParentFolderPath(folder.path) === null;
  }
  return getParentFolderPath(folder.path) === parentPath;
};

const parentIdOf = (folder: Folder): string | null => {
  const parentPath = getParentFolderPath(folder.path);
  if (!parentPath) return null;
  return parentPath.split("/").filter(Boolean).pop() ?? null;
};

/** Children keyed by parent folder id (`null` = root). */
const buildChildrenByParentId = (folders: Folder[]) => {
  const map = new Map<string | null, Folder[]>();
  for (const folder of folders) {
    const parentId = parentIdOf(folder);
    const list = map.get(parentId) ?? [];
    list.push(folder);
    map.set(parentId, list);
  }
  for (const list of map.values()) {
    list.sort((a, b) => a.label.localeCompare(b.label));
  }
  return map;
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
  /** If true, dismiss the hosting bottom sheet after confirm. */
  dismissOnSelect?: boolean;
  /** Prefix for the confirm button, e.g. "Move into" → "Move into Work". */
  actionVerb?: string;
  /** When false, that destination cannot be chosen (still browsable). */
  isDestinationEnabled?: (folder: FolderSelection) => boolean;
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
        <TouchableOpacity className="flex-row items-center gap-1.5 self-start rounded-full bg-card py-1.5">
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
  onSelect: (folder: FolderSelection) => void;
  sheet: ReturnType<typeof useBottomSheet>;
  active: boolean;
  onDismiss?: () => void;
  isDestinationEnabled?: (folder: FolderSelection) => boolean;
  actionVerb?: string;
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
  isDestinationEnabled,
  actionVerb = "Move into",
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
              actionVerb={actionVerb}
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
  isDestinationEnabled,
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

  const childrenByParentId = useMemo(
    () => buildChildrenByParentId(visibleFolders),
    [visibleFolders]
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

  const [expandedIds, setExpandedIds] = useState<Set<string>>(() => {
    const initial = new Set<string>([ROOT_ID]);
    if (selectedFolder) {
      for (const id of getFolderIdsFromPath(selectedFolder.path)) {
        initial.add(id);
      }
    }
    return initial;
  });

  const browseFolder = browseFolderId
    ? (foldersById.get(browseFolderId) ?? null)
    : null;

  // Keep the tree open along the path to the current location.
  useEffect(() => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      next.add(ROOT_ID);
      if (browseFolder) {
        for (const id of getFolderIdsFromPath(browseFolder.path)) {
          next.add(id);
        }
      }
      return next;
    });
  }, [browseFolder]);

  const childFolders = useMemo(() => {
    const parentPath = browseFolder?.path ?? null;
    return visibleFolders
      .filter((folder) => isDirectChild(parentPath, folder))
      .sort((a, b) => a.label.localeCompare(b.label));
  }, [browseFolder?.path, visibleFolders]);

  const breadcrumbItems = useMemo(() => {
    const root = { id: ROOT_ID, name: "Root" };
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

  const handleConfirm = () => {
    if (!destinationEnabled) return;
    onSelect(browseFolder);
    if (dismissOnSelect) dismiss();
  };

  const toggleExpanded = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
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
          onNavigate={(id) => setBrowseFolderId(id === ROOT_ID ? null : id)}
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
          {/* Left: expandable folder tree */}
          <View className="flex-1">
            <ScrollView
              nestedScrollEnabled
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={{
                paddingVertical: 4,
                paddingHorizontal: 4,
              }}
            >
              <FolderTreeRow
                id={ROOT_ID}
                label="Root"
                depth={0}
                isCurrent={browseFolderId === null}
                hasChildren={(childrenByParentId.get(null) ?? []).length > 0}
                expanded={expandedIds.has(ROOT_ID)}
                borderColor={paneBorder}
                onToggle={() => toggleExpanded(ROOT_ID)}
                onNavigate={() => setBrowseFolderId(null)}
              />
              {expandedIds.has(ROOT_ID)
                ? (childrenByParentId.get(null) ?? []).map((folder) => (
                    <FolderTreeBranch
                      key={folder.id}
                      folder={folder}
                      depth={1}
                      childrenByParentId={childrenByParentId}
                      expandedIds={expandedIds}
                      browseFolderId={browseFolderId}
                      borderColor={paneBorder}
                      onToggle={toggleExpanded}
                      onNavigate={setBrowseFolderId}
                    />
                  ))
                : null}
            </ScrollView>
          </View>

          {showContentPanel ? (
            <>
              {/* Divider between location tree and contents */}
              <View
                className="self-stretch"
                style={{ width: 1, backgroundColor: paneBorder }}
              />

              {/* Right: contents of the browsed folder */}
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
          <Typography variant="h4" style={{ opacity: 0.6 }} numberOfLines={1}>
            {actionVerb}
          </Typography>
          <Typography variant="h4" className="font-semibold" numberOfLines={1}>
            "{destinationLabel}"
          </Typography>
        </View>
      </Button>
    </View>
  );
}

function FolderTreeBranch({
  folder,
  depth,
  childrenByParentId,
  expandedIds,
  browseFolderId,
  borderColor,
  onToggle,
  onNavigate,
}: {
  folder: Folder;
  depth: number;
  childrenByParentId: Map<string | null, Folder[]>;
  expandedIds: Set<string>;
  browseFolderId: string | null;
  borderColor: string;
  onToggle: (id: string) => void;
  onNavigate: (id: string) => void;
}) {
  const children = childrenByParentId.get(folder.id) ?? [];
  const expanded = expandedIds.has(folder.id);

  return (
    <>
      <FolderTreeRow
        id={folder.id}
        label={folder.label}
        depth={depth}
        isCurrent={browseFolderId === folder.id}
        hasChildren={children.length > 0}
        expanded={expanded}
        borderColor={borderColor}
        onToggle={() => onToggle(folder.id)}
        onNavigate={() => onNavigate(folder.id)}
      />
      {expanded
        ? children.map((child) => (
            <FolderTreeBranch
              key={child.id}
              folder={child}
              depth={depth + 1}
              childrenByParentId={childrenByParentId}
              expandedIds={expandedIds}
              browseFolderId={browseFolderId}
              borderColor={borderColor}
              onToggle={onToggle}
              onNavigate={onNavigate}
            />
          ))
        : null}
    </>
  );
}

function FolderTreeRow({
  label,
  depth,
  isCurrent,
  hasChildren,
  expanded,
  borderColor,
  onToggle,
  onNavigate,
}: {
  id: string;
  label: string;
  depth: number;
  isCurrent: boolean;
  hasChildren: boolean;
  expanded: boolean;
  borderColor: string;
  onToggle: () => void;
  onNavigate: () => void;
}) {
  return (
    <View
      className={cn(
        "flex-row items-center rounded-2xl border border-transparent",
        isCurrent ? "opacity-100" : "opacity-90"
      )}
      style={{
        paddingLeft: 4 + depth * 12,
        backgroundColor: isCurrent ? borderColor : "transparent",
      }}
    >
      {hasChildren ? (
        <Pressable
          onPress={onToggle}
          hitSlop={8}
          className="h-8 w-7 items-center justify-center"
          accessibilityRole="button"
          accessibilityLabel={expanded ? "Collapse" : "Expand"}
        >
          <Icon
            name={expanded ? "chevron-down" : "chevron-right"}
            color="muted-foreground"
            size={14}
          />
        </Pressable>
      ) : (
        <View className="h-8 w-7" />
      )}

      <Pressable
        onPress={onNavigate}
        className="flex-1 flex-row items-center gap-1.5 py-2 pr-2 min-w-0"
      >
        <Icon
          name="folder"
          color={isCurrent ? "foreground" : "muted-foreground"}
          size={14}
        />
        <Typography
          variant="p"
          className={cn("flex-1", isCurrent ? "font-semibold" : "")}
          numberOfLines={1}
        >
          {label}
        </Typography>
      </Pressable>
    </View>
  );
}
