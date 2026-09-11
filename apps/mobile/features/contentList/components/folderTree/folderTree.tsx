import React, { useEffect, useMemo, useState } from "react";
import { Pressable, ScrollView, View } from "react-native";
import { getFolderIdsFromPath } from "@repo/sqlite";
import { Folder } from "@repo/zod-schemas";
import { Typography } from "@/components/ui";
import { Icon } from "@/components/ui/icons/icon";
import { useColorScheme } from "@/lib/useColorScheme";
import { hsl } from "@/utils/hsl";
import { cn } from "@/lib/cn";
import {
  FolderActionsMenu,
  FolderActionsTarget,
} from "@/features/contentList/features/folderContents/components/folderActionsMenu";
import { FileActionsMenu } from "./fileActionsMenu";
import {
  FOLDER_TREE_ROOT_ID,
  buildChildrenByParentId,
  filterFoldersExcludingPath,
  type FolderTreeFile,
} from "./folderTreeUtils";

export type { FolderTreeFile };

export type FolderTreeProps = {
  folders: Folder[];
  /** Currently highlighted folder id (`null` = root). */
  selectedFolderId: string | null;
  onSelect: (folderId: string | null) => void;
  /** Hide this path and its descendants (e.g. folder being moved). */
  excludePathPrefix?: string | null;
  rootLabel?: string;
  className?: string;
  /** When false, omit the outer ScrollView (parent scrolls instead). */
  scrollable?: boolean;
  /** When true, render note/file leaves under each folder. */
  showFiles?: boolean;
  files?: FolderTreeFile[];
  selectedFileId?: string | null;
  onFileSelect?: (fileId: string) => void;
  /** Long-press opens folder actions bottom sheet. */
  enableFolderActions?: boolean;
  /** Long-press opens file actions bottom sheet (view / edit / delete). */
  enableFileActions?: boolean;
  /** Called before navigating away from a file action (e.g. close sidebar). */
  onFileActionNavigate?: () => void;
  /**
   * When `showLocationPin` is true, mark this folder with a light map-pin
   * (`null` = root).
   */
  locationPinFolderId?: string | null;
  showLocationPin?: boolean;
};

export function FolderTree({
  folders,
  selectedFolderId,
  onSelect,
  excludePathPrefix = null,
  rootLabel = "Root",
  className,
  scrollable = true,
  showFiles = false,
  files = [],
  selectedFileId = null,
  onFileSelect,
  enableFolderActions = false,
  enableFileActions = false,
  onFileActionNavigate,
  locationPinFolderId = null,
  showLocationPin = false,
}: FolderTreeProps) {
  const { colorScheme } = useColorScheme();
  const highlightColor = hsl("border", colorScheme);
  // Dark muted is nearly background — use a lighter surface so the pin row reads.
  const locationPinColor =
    colorScheme === "dark"
      ? hsl("secondary", colorScheme)
      : hsl("muted", colorScheme);

  const visibleFolders = useMemo(
    () => filterFoldersExcludingPath(folders, excludePathPrefix),
    [excludePathPrefix, folders]
  );

  const childrenByParentId = useMemo(
    () => buildChildrenByParentId(visibleFolders),
    [visibleFolders]
  );

  const foldersById = useMemo(
    () => new Map(visibleFolders.map((folder) => [folder.id, folder])),
    [visibleFolders]
  );

  const filesByFolderId = useMemo(() => {
    const map = new Map<string | null, FolderTreeFile[]>();
    if (!showFiles) return map;
    for (const file of files) {
      const key = file.folderId;
      const list = map.get(key) ?? [];
      list.push(file);
      map.set(key, list);
    }
    for (const list of map.values()) {
      list.sort((a, b) => a.title.localeCompare(b.title));
    }
    return map;
  }, [files, showFiles]);

  const [expandedIds, setExpandedIds] = useState<Set<string>>(() => {
    const initial = new Set<string>([FOLDER_TREE_ROOT_ID]);
    if (selectedFolderId) {
      const folder = folders.find((f) => f.id === selectedFolderId);
      if (folder) {
        for (const id of getFolderIdsFromPath(folder.path)) {
          initial.add(id);
        }
      }
    }
    return initial;
  });

  // Keep ancestors expanded so the current / pinned folder stays visible.
  useEffect(() => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      next.add(FOLDER_TREE_ROOT_ID);
      const ensurePath = (folderId: string | null) => {
        if (!folderId) return;
        const folder = foldersById.get(folderId);
        if (!folder) return;
        for (const id of getFolderIdsFromPath(folder.path)) {
          next.add(id);
        }
      };
      ensurePath(selectedFolderId);
      if (showLocationPin) {
        ensurePath(locationPinFolderId);
      }
      return next;
    });
  }, [foldersById, locationPinFolderId, selectedFolderId, showLocationPin]);

  const toggleExpanded = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const rootChildFolders = childrenByParentId.get(null) ?? [];
  const rootFiles = filesByFolderId.get(null) ?? [];
  const rootHasChildren =
    rootChildFolders.length > 0 || (showFiles && rootFiles.length > 0);

  const tree = (
    <>
      <FolderTreeRow
        label={rootLabel}
        depth={0}
        kind="root"
        isCurrent={selectedFolderId === null && !selectedFileId}
        showLocationPin={showLocationPin && locationPinFolderId === null}
        hasChildren={rootHasChildren}
        expanded={expandedIds.has(FOLDER_TREE_ROOT_ID)}
        highlightColor={highlightColor}
        locationPinColor={locationPinColor}
        onToggle={() => toggleExpanded(FOLDER_TREE_ROOT_ID)}
        onNavigate={() => onSelect(null)}
        enableFolderActions={enableFolderActions}
        actionsTarget={{ kind: "root" }}
      />
      {expandedIds.has(FOLDER_TREE_ROOT_ID) ? (
        <>
          {rootChildFolders.map((folder) => (
            <FolderTreeBranch
              key={folder.id}
              folder={folder}
              depth={1}
              childrenByParentId={childrenByParentId}
              filesByFolderId={filesByFolderId}
              expandedIds={expandedIds}
              selectedFolderId={selectedFolderId}
              selectedFileId={selectedFileId}
              locationPinFolderId={locationPinFolderId}
              showLocationPin={showLocationPin}
              showFiles={showFiles}
              enableFolderActions={enableFolderActions}
              enableFileActions={enableFileActions}
              highlightColor={highlightColor}
              locationPinColor={locationPinColor}
              onToggle={toggleExpanded}
              onNavigate={onSelect}
              onFileSelect={onFileSelect}
              onFileActionNavigate={onFileActionNavigate}
            />
          ))}
          {showFiles
            ? rootFiles.map((file) => (
                <FolderTreeRow
                  key={`file-${file.id}`}
                  label={file.title || "Untitled"}
                  depth={1}
                  kind="file"
                  isCurrent={selectedFileId === file.id}
                  hasChildren={false}
                  expanded={false}
                  highlightColor={highlightColor}
                  onToggle={() => undefined}
                  onNavigate={() => onFileSelect?.(file.id)}
                  enableFileActions={enableFileActions}
                  fileActionsTarget={file}
                  onFileActionNavigate={onFileActionNavigate}
                />
              ))
            : null}
        </>
      ) : null}
    </>
  );

  if (!scrollable) {
    return <View className={cn("w-full", className)}>{tree}</View>;
  }

  return (
    <ScrollView
      className={cn("w-full", className)}
      nestedScrollEnabled
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={{
        paddingVertical: 4,
        paddingHorizontal: 4,
      }}
    >
      {tree}
    </ScrollView>
  );
}

function FolderTreeBranch({
  folder,
  depth,
  childrenByParentId,
  filesByFolderId,
  expandedIds,
  selectedFolderId,
  selectedFileId,
  locationPinFolderId,
  showLocationPin,
  showFiles,
  enableFolderActions,
  enableFileActions,
  highlightColor,
  locationPinColor,
  onToggle,
  onNavigate,
  onFileSelect,
  onFileActionNavigate,
}: {
  folder: Folder;
  depth: number;
  childrenByParentId: Map<string | null, Folder[]>;
  filesByFolderId: Map<string | null, FolderTreeFile[]>;
  expandedIds: Set<string>;
  selectedFolderId: string | null;
  selectedFileId: string | null;
  locationPinFolderId: string | null;
  showLocationPin: boolean;
  showFiles: boolean;
  enableFolderActions: boolean;
  enableFileActions: boolean;
  highlightColor: string;
  locationPinColor: string;
  onToggle: (id: string) => void;
  onNavigate: (id: string | null) => void;
  onFileSelect?: (fileId: string) => void;
  onFileActionNavigate?: () => void;
}) {
  const children = childrenByParentId.get(folder.id) ?? [];
  const folderFiles = filesByFolderId.get(folder.id) ?? [];
  const expanded = expandedIds.has(folder.id);
  const hasChildren =
    children.length > 0 || (showFiles && folderFiles.length > 0);

  return (
    <>
      <FolderTreeRow
        label={folder.label}
        depth={depth}
        kind="folder"
        isCurrent={selectedFolderId === folder.id && !selectedFileId}
        showLocationPin={showLocationPin && locationPinFolderId === folder.id}
        hasChildren={hasChildren}
        expanded={expanded}
        highlightColor={highlightColor}
        locationPinColor={locationPinColor}
        onToggle={() => onToggle(folder.id)}
        onNavigate={() => onNavigate(folder.id)}
        enableFolderActions={enableFolderActions}
        actionsTarget={{ kind: "folder", folder }}
      />
      {expanded ? (
        <>
          {children.map((child) => (
            <FolderTreeBranch
              key={child.id}
              folder={child}
              depth={depth + 1}
              childrenByParentId={childrenByParentId}
              filesByFolderId={filesByFolderId}
              expandedIds={expandedIds}
              selectedFolderId={selectedFolderId}
              selectedFileId={selectedFileId}
              locationPinFolderId={locationPinFolderId}
              showLocationPin={showLocationPin}
              showFiles={showFiles}
              enableFolderActions={enableFolderActions}
              enableFileActions={enableFileActions}
              highlightColor={highlightColor}
              locationPinColor={locationPinColor}
              onToggle={onToggle}
              onNavigate={onNavigate}
              onFileSelect={onFileSelect}
              onFileActionNavigate={onFileActionNavigate}
            />
          ))}
          {showFiles
            ? folderFiles.map((file) => (
                <FolderTreeRow
                  key={`file-${file.id}`}
                  label={file.title || "Untitled"}
                  depth={depth + 1}
                  kind="file"
                  isCurrent={selectedFileId === file.id}
                  hasChildren={false}
                  expanded={false}
                  highlightColor={highlightColor}
                  onToggle={() => undefined}
                  onNavigate={() => onFileSelect?.(file.id)}
                  enableFileActions={enableFileActions}
                  fileActionsTarget={file}
                  onFileActionNavigate={onFileActionNavigate}
                />
              ))
            : null}
        </>
      ) : null}
    </>
  );
}

function FolderTreeRow({
  label,
  depth,
  kind,
  isCurrent,
  showLocationPin = false,
  hasChildren,
  expanded,
  highlightColor,
  locationPinColor,
  onToggle,
  onNavigate,
  enableFolderActions = false,
  actionsTarget,
  enableFileActions = false,
  fileActionsTarget,
  onFileActionNavigate,
}: {
  label: string;
  depth: number;
  kind: "root" | "folder" | "file";
  isCurrent: boolean;
  showLocationPin?: boolean;
  hasChildren: boolean;
  expanded: boolean;
  highlightColor: string;
  locationPinColor?: string;
  onToggle: () => void;
  onNavigate: () => void;
  enableFolderActions?: boolean;
  actionsTarget?: FolderActionsTarget;
  enableFileActions?: boolean;
  fileActionsTarget?: FolderTreeFile;
  onFileActionNavigate?: () => void;
}) {
  const { colorScheme } = useColorScheme();
  const iconName =
    kind === "root" ? "house" : kind === "folder" ? "folder" : "notebook-text";

  const useFolderMenu = Boolean(enableFolderActions && actionsTarget);
  const useFileMenu = Boolean(
    kind === "file" && enableFileActions && fileActionsTarget
  );

  const locationPin = showLocationPin ? (
    <Icon
      name="map-pin-simple"
      color={colorScheme === "dark" ? "foreground" : "muted-foreground"}
      hslColor={colorScheme === "dark" ? "#FFFFFF" : undefined}
      size={12}
      opacity={colorScheme === "dark" ? 100 : 35}
    />
  ) : null;

  const rowBackground = isCurrent
    ? highlightColor
    : showLocationPin && locationPinColor
      ? locationPinColor
      : "transparent";

  const labelContent = (
    <View
      pointerEvents={useFolderMenu || useFileMenu ? "box-only" : "auto"}
      className="flex-1 flex-row items-center gap-1.5 py-2 pr-2 min-w-0"
    >
      <Icon
        name={iconName}
        color={isCurrent ? "foreground" : "muted-foreground"}
        size={kind === "root" ? 16 : 14}
      />
      <Typography
        variant="p"
        className={cn("flex-1", isCurrent ? "font-semibold" : "")}
        numberOfLines={1}
      >
        {kind === "root" ? "Root" : label}
      </Typography>
      {locationPin}
    </View>
  );

  return (
    <View
      className={cn(
        "flex-row items-center rounded-2xl border border-transparent",
        isCurrent || showLocationPin ? "opacity-100" : "opacity-90"
      )}
      style={{
        paddingLeft: 4 + depth * 12,
        backgroundColor: rowBackground,
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

      {useFolderMenu && actionsTarget ? (
        <FolderActionsMenu
          target={actionsTarget}
          onNavigate={onNavigate}
          className="flex-1 min-w-0"
        >
          {labelContent}
        </FolderActionsMenu>
      ) : useFileMenu && fileActionsTarget ? (
        <FileActionsMenu
          file={fileActionsTarget}
          onNavigate={onNavigate}
          onCloseSidebar={onFileActionNavigate}
          className="flex-1 min-w-0"
        >
          {labelContent}
        </FileActionsMenu>
      ) : (
        <Pressable
          onPress={onNavigate}
          className="flex-1 flex-row items-center gap-1.5 py-2 pr-2 min-w-0"
          accessibilityLabel={kind === "root" ? "Root" : label}
        >
          <Icon
            name={iconName}
            color={isCurrent ? "foreground" : "muted-foreground"}
            size={kind === "root" ? 16 : 14}
          />
          <Typography
            variant="p"
            className={cn("flex-1", isCurrent ? "font-semibold" : "")}
            numberOfLines={1}
          >
            {kind === "root" ? "Root" : label}
          </Typography>
          {locationPin}
        </Pressable>
      )}
    </View>
  );
}
