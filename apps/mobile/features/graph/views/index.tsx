import React, { useCallback, useEffect, useMemo, useState } from "react";
import { View } from "react-native";
import { useFocusEffect } from "expo-router";
import { useGraphStore } from "../context/graphContext";
import { useGraph } from "../hooks/useGraph";
import CirclePackSkia from "../components/graphSkia";
import { GraphLoadingPlaceholder } from "../components/graphLoadingPlaceholder";
import GraphInfos from "../components/graphInfos/graphInfos";
import { NodeDatum } from "../types/types";
import { SpaceFiller } from "@/components/ui/spaceFiller";
import { filterGraphHierarchy } from "../utils/filterGraphHierarchy";
import {
  findParentFolderId,
  sliceFolderWindow,
} from "../utils/windowFolderHierarchy";

export const GraphFeature = ({
  focusedThoughtId,
  trigger,
}: {
  focusedThoughtId?: string;
  trigger?: string;
}) => {
  const renderMode = useGraphStore((state) => state.renderMode);
  const selectedFolderId = useGraphStore((state) => state.selectedFolderId);
  const selectedCategoryId = useGraphStore((state) => state.selectedCategoryId);
  const folderWindowRootId = useGraphStore((state) => state.folderWindowRootId);
  const setFolderWindowRootId = useGraphStore(
    (state) => state.setFolderWindowRootId
  );
  const { hierarchies, isLoading, refetchGraph, refetchSyncFlag } = useGraph();

  const filteredHierarchy = useMemo(() => {
    if (!hierarchies) return null;
    return filterGraphHierarchy(
      hierarchies[renderMode],
      renderMode,
      selectedFolderId,
      selectedCategoryId
    );
  }, [hierarchies, renderMode, selectedFolderId, selectedCategoryId]);

  const hierarchy = useMemo(() => {
    if (!filteredHierarchy) return null;
    if (renderMode !== "folder") return filteredHierarchy;
    return sliceFolderWindow(filteredHierarchy, folderWindowRootId);
  }, [filteredHierarchy, folderWindowRootId, renderMode]);

  const [selection, setSelection] = useState<{
    active: NodeDatum | null;
    parent: NodeDatum | null;
  }>({ active: null, parent: null });

  useFocusEffect(
    useCallback(() => {
      refetchGraph();
      refetchSyncFlag();
    }, [refetchGraph, refetchSyncFlag])
  );

  const handleNodeSelected = useCallback(
    (node: NodeDatum, parent?: NodeDatum) => {
      setSelection({
        active: node,
        parent: parent || null,
      });
    },
    []
  );

  const handleRevealFolder = useCallback(
    (node: NodeDatum) => {
      if (!node.folderId) return;
      setFolderWindowRootId(node.folderId);
      setSelection({ active: null, parent: null });
    },
    [setFolderWindowRootId]
  );

  const handleAscendFolderWindow = useCallback(() => {
    if (!filteredHierarchy || !folderWindowRootId) return;
    const parentId = findParentFolderId(filteredHierarchy, folderWindowRootId);
    setFolderWindowRootId(parentId);
    setSelection({ active: null, parent: null });
  }, [filteredHierarchy, folderWindowRootId, setFolderWindowRootId]);

  useEffect(() => {
    setSelection({ active: null, parent: null });
  }, [renderMode, selectedFolderId, selectedCategoryId, folderWindowRootId]);

  if (isLoading || !hierarchy) {
    return (
      <View className="flex-col gap-4 items-center flex-1">
        <GraphLoadingPlaceholder />
        <SpaceFiller
          sizes={{ paddingBottom: ["TAB_BAR_HEIGHT", "HEADER_OVERLAP"] }}
        />
      </View>
    );
  }

  const activeNode = selection.active ?? hierarchy;

  return (
    <View className="flex-col gap-4 items-center flex-1">
      <CirclePackSkia
        data={hierarchy}
        pathHierarchy={filteredHierarchy}
        graphMode={renderMode}
        focusedThoughtId={focusedThoughtId}
        trigger={trigger}
        onNodeSelected={handleNodeSelected}
        onRevealFolder={
          renderMode === "folder" ? handleRevealFolder : undefined
        }
        onAscendFolderWindow={
          renderMode === "folder" && folderWindowRootId
            ? handleAscendFolderWindow
            : undefined
        }
      />

      <View className="w-full flex-1">
        <GraphInfos
          activeNode={activeNode}
          focusedThoughtId={focusedThoughtId}
        />
      </View>
      <SpaceFiller
        sizes={{ paddingBottom: ["TAB_BAR_HEIGHT", "HEADER_OVERLAP"] }}
      />
    </View>
  );
};
