import { CollapsibleContainer } from "@/components/ui/collapsibleContainer";
import { PageOptionsHeaderContainer } from "@/components/layout/page/pageOptionsHeaderContainer";
import { TriggerFilterChip } from "@/features/contentList/components/optionsBar/components/triggerFilterChip";
import { NewFolderButton } from "@/features/contentList/components/optionsBar/components/optionsBar";
import { useFolderActions } from "@/features/contentList/components/optionsBar/hooks/useFolderActions";
import { useOptionsBar } from "@/features/contentList/components/optionsBar/context/optionBarContext";
import { useControllers } from "@/api/controllers/useControllers";
import { canCreateChildFolder } from "@repo/sqlite";
import { memo, useEffect, useMemo, useState } from "react";
import { View } from "react-native";
import { useGraphStore } from "../context/graphContext";
import { GraphMode } from "../types/types";
import { BreadcrumbLinkToggle } from "@/features/navigation/breadcrumbLinkToggle";
import { folderIdFromGraphTarget } from "@/features/navigation/syncLinkedBreadcrumbs";
import { GraphBreadcrumbs } from "./graphInfos/graphBreadcrumbs";
import { Gutter } from "@/components/ui/gutter";

const DEFAULT_GRAPH_MODE: GraphMode = "category";

export const GraphModeToggle = memo(function GraphModeToggle() {
  const [expanded, setExpanded] = useState(false);
  const [mode, setMode] = useState<GraphMode>(
    () => useGraphStore.getState().mode
  );
  const hierarchy = useGraphStore((s) => s.breadcrumbHierarchy);
  const activeId = useGraphStore((s) => s.breadcrumbActiveId);
  const folderTreeSidebarOpen = useOptionsBar(
    (state) => state.folderTreeSidebarOpen
  );
  const toggleFolderTreeSidebar = useOptionsBar(
    (state) => state.toggleFolderTreeSidebar
  );
  const handleFoldersModeChange = useOptionsBar(
    (state) => state.handleFoldersModeChange
  );
  const handleCurrentFolderChange = useOptionsBar(
    (state) => state.handleCurrentFolderChange
  );
  const { openCreateFolderModal } = useFolderActions();
  const { folders } = useControllers();
  const { data: allFolders = [] } = folders.useFetchAllFoldersQuery({
    enabled: mode === "folder",
  });

  const foldersById = useMemo(
    () => new Map(allFolders.map((folder) => [folder.id, folder])),
    [allFolders]
  );

  const currentFolder = useMemo(() => {
    if (mode !== "folder") return null;
    const folderId = folderIdFromGraphTarget(activeId ?? "root", hierarchy);
    if (typeof folderId !== "string") return null;
    return foldersById.get(folderId) ?? null;
  }, [activeId, foldersById, hierarchy, mode]);

  useEffect(
    () =>
      useGraphStore.subscribe((state, prevState) => {
        if (state.mode !== prevState.mode) {
          setMode(state.mode);
        }
      }),
    []
  );

  const onCreateFolder = () => {
    openCreateFolderModal(
      currentFolder
        ? { kind: "folder", folder: currentFolder }
        : { kind: "root" }
    );
  };

  const showFolderTools = mode === "folder";
  const canCreateHere = canCreateChildFolder(currentFolder?.path ?? null);

  return (
    <PageOptionsHeaderContainer
      footer={
        <CollapsibleContainer expanded={expanded}>
          <Gutter size="md" className="mb-2">
            <View className="flex-row items-center gap-2 rounded-full px-2.5 py-1.5">
              <BreadcrumbLinkToggle />
            </View>
          </Gutter>
        </CollapsibleContainer>
      }
    >
      <View className="h-full w-full flex-row items-center gap-2">
        <View className="shrink-0">
          <TriggerFilterChip
            icon="funnel"
            selected={expanded}
            showDot={mode !== DEFAULT_GRAPH_MODE}
            onPress={() => setExpanded((prev) => !prev)}
          />
        </View>
        <GraphBreadcrumbs />
        {showFolderTools && canCreateHere ? (
          <NewFolderButton onPress={onCreateFolder} />
        ) : null}
        {showFolderTools ? (
          <View className="shrink-0">
            <TriggerFilterChip
              icon="folder-tree"
              selected={folderTreeSidebarOpen}
              onPress={() => {
                if (!folderTreeSidebarOpen) {
                  const folderId = folderIdFromGraphTarget(
                    activeId ?? "root",
                    hierarchy
                  );
                  handleFoldersModeChange("with");
                  if (folderId !== undefined) {
                    handleCurrentFolderChange(folderId);
                  }
                }
                toggleFolderTreeSidebar();
              }}
            />
          </View>
        ) : null}
      </View>
    </PageOptionsHeaderContainer>
  );
});
