import React, { useEffect, useMemo, useState } from "react";
import { Pressable, ScrollView, View } from "react-native";
import { getFolderIdsFromPath } from "@repo/sqlite";
import { Folder } from "@repo/zod-schemas/src/schemas";
import { Typography } from "@/components/ui";
import { Icon } from "@/components/ui/icons/icon";
import { useColorScheme } from "@/lib/useColorScheme";
import { hsl } from "@/utils/hsl";
import { cn } from "@/lib/cn";
import {
  FOLDER_TREE_ROOT_ID,
  buildChildrenByParentId,
  filterFoldersExcludingPath,
} from "./folderTreeUtils";

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
};

export function FolderTree({
  folders,
  selectedFolderId,
  onSelect,
  excludePathPrefix = null,
  rootLabel = "Root",
  className,
  scrollable = true,
}: FolderTreeProps) {
  const { colorScheme } = useColorScheme();
  const highlightColor = hsl("border", colorScheme);

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

  // Keep ancestors expanded so the current folder stays visible.
  useEffect(() => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      next.add(FOLDER_TREE_ROOT_ID);
      if (selectedFolderId) {
        const folder = foldersById.get(selectedFolderId);
        if (folder) {
          for (const id of getFolderIdsFromPath(folder.path)) {
            next.add(id);
          }
        }
      }
      return next;
    });
  }, [foldersById, selectedFolderId]);

  const toggleExpanded = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const tree = (
    <>
      <FolderTreeRow
        label={rootLabel}
        depth={0}
        isCurrent={selectedFolderId === null}
        hasChildren={(childrenByParentId.get(null) ?? []).length > 0}
        expanded={expandedIds.has(FOLDER_TREE_ROOT_ID)}
        highlightColor={highlightColor}
        onToggle={() => toggleExpanded(FOLDER_TREE_ROOT_ID)}
        onNavigate={() => onSelect(null)}
      />
      {expandedIds.has(FOLDER_TREE_ROOT_ID)
        ? (childrenByParentId.get(null) ?? []).map((folder) => (
            <FolderTreeBranch
              key={folder.id}
              folder={folder}
              depth={1}
              childrenByParentId={childrenByParentId}
              expandedIds={expandedIds}
              selectedFolderId={selectedFolderId}
              highlightColor={highlightColor}
              onToggle={toggleExpanded}
              onNavigate={onSelect}
            />
          ))
        : null}
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
  expandedIds,
  selectedFolderId,
  highlightColor,
  onToggle,
  onNavigate,
}: {
  folder: Folder;
  depth: number;
  childrenByParentId: Map<string | null, Folder[]>;
  expandedIds: Set<string>;
  selectedFolderId: string | null;
  highlightColor: string;
  onToggle: (id: string) => void;
  onNavigate: (id: string | null) => void;
}) {
  const children = childrenByParentId.get(folder.id) ?? [];
  const expanded = expandedIds.has(folder.id);

  return (
    <>
      <FolderTreeRow
        label={folder.label}
        depth={depth}
        isCurrent={selectedFolderId === folder.id}
        hasChildren={children.length > 0}
        expanded={expanded}
        highlightColor={highlightColor}
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
              selectedFolderId={selectedFolderId}
              highlightColor={highlightColor}
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
  highlightColor,
  onToggle,
  onNavigate,
}: {
  label: string;
  depth: number;
  isCurrent: boolean;
  hasChildren: boolean;
  expanded: boolean;
  highlightColor: string;
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
        backgroundColor: isCurrent ? highlightColor : "transparent",
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
