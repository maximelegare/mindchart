import React, { useMemo } from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { useRouter } from "expo-router";
import { useControllers } from "@/api/controllers/useControllers";
import { Typography } from "@/components/ui";
import { Icon } from "@/components/ui/icons/icon";
import { useColorScheme } from "@/lib/useColorScheme";
import { hsl } from "@/utils/hsl";
import { useGraphStore } from "../context/graphContext";
import { folderNodeId } from "../utils/buildGraphByFolder";
import type { NodeDatum } from "../types/types";

/** Find a folder pack node id in the live hierarchy (folder- or category-scoped). */
function findFolderGraphNodeId(
  hierarchy: NodeDatum | null,
  folderId: string
): string {
  if (!hierarchy) return folderNodeId(folderId);

  const walk = (node: NodeDatum): string | null => {
    if (node.folderId === folderId) return node.id;
    for (const child of node.children ?? []) {
      const found = walk(child);
      if (found) return found;
    }
    return null;
  };

  return walk(hierarchy) ?? folderNodeId(folderId);
}

function isFolderActive(
  hierarchy: NodeDatum | null,
  activeId: string | null,
  folderId: string
): boolean {
  if (!activeId) return false;
  if (activeId === folderNodeId(folderId)) return true;
  if (!hierarchy) return false;

  const walk = (node: NodeDatum): boolean => {
    if (node.id === activeId) {
      return node.folderId === folderId;
    }
    return (node.children ?? []).some(walk);
  };
  return walk(hierarchy);
}

/** Horizontal folder chips — tap zooms the graph to that folder. */
export function GraphFolderChips() {
  const { colorScheme } = useColorScheme();
  const { setParams } = useRouter();
  const hierarchy = useGraphStore((s) => s.breadcrumbHierarchy);
  const activeId = useGraphStore((s) => s.breadcrumbActiveId);

  const { useFetchAllFoldersWithNotesInfosQuery } = useControllers().folders;
  const { data: foldersData } = useFetchAllFoldersWithNotesInfosQuery();

  const folders = useMemo(() => {
    if (!foldersData || !Array.isArray(foldersData)) return [];
    return foldersData
      .filter((folder) => (folder.noteCount ?? 0) > 0)
      .map((folder) => ({
        id: folder.id,
        label: folder.label,
      }))
      .sort((a, b) => a.label.localeCompare(b.label));
  }, [foldersData]);

  if (folders.length === 0) return null;

  const zoomToFolder = (folderId: string) => {
    // Clear list filters so the full graph stays visible while we zoom.
    useGraphStore.setState({
      selectedFolderId: null,
      selectedCategoryId: null,
    });

    const alreadyActive = isFolderActive(hierarchy, activeId, folderId);
    setParams({
      id: alreadyActive ? "root" : findFolderGraphNodeId(hierarchy, folderId),
      _t: Date.now().toString(),
    });
  };

  return (
    <View className="w-full shrink-0">
      <ScrollView
        horizontal
        nestedScrollEnabled
        keyboardShouldPersistTaps="handled"
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{
          flexDirection: "row",
          alignItems: "center",
          gap: 8,
          paddingHorizontal: 8,
          paddingVertical: 8,
        }}
      >
        {folders.map((folder) => {
          const selected = isFolderActive(hierarchy, activeId, folder.id);
          const chipBg = hsl("background", colorScheme);
          const chipBorder = hsl(
            selected ? "border" : "background",
            colorScheme
          );
          const labelColor = hsl(
            selected ? "text" : "muted-foreground",
            colorScheme
          );
          return (
            <TouchableOpacity
              key={folder.id}
              onPress={() => zoomToFolder(folder.id)}
              className="min-w-10 flex-row items-center gap-1.5 rounded-full border px-2 py-1"
              style={{ backgroundColor: chipBg, borderColor: chipBorder }}
              accessibilityRole="button"
              accessibilityState={{ selected }}
              accessibilityLabel={`Zoom to ${folder.label}`}
            >
              <Icon
                name="folder"
                color={selected ? "text" : "muted-foreground"}
                size={16}
              />
              <Typography
                variant="p"
                className="text-xs"
                style={{ color: labelColor }}
                numberOfLines={1}
              >
                {folder.label}
              </Typography>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
      <View
        style={{
          height: StyleSheet.hairlineWidth,
          width: "100%",
          backgroundColor: hsl("border", colorScheme),
        }}
      />
    </View>
  );
}
