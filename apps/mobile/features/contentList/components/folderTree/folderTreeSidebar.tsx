import React, { useMemo } from "react";
import { ScrollView, View } from "react-native";
import { useRouter } from "expo-router";
import { getFolderIdsFromPath } from "@repo/sqlite";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Sidebar } from "@/components/ui/sidebar/sidebar";
import { useControllers } from "@/api/controllers/useControllers";
import { useColorScheme } from "@/lib/useColorScheme";
import { hsl } from "@/utils/hsl";
import { useOptionsBar } from "../optionsBar/context/optionBarContext";
import { FolderTree, FolderTreeFile } from "./folderTree";
import { FOLDER_TREE_ROOT_ID } from "./folderTreeUtils";

export function FolderTreeSidebar() {
  const router = useRouter();
  const { colorScheme } = useColorScheme();
  const open = useOptionsBar((s) => s.folderTreeSidebarOpen);
  const setFolderTreeSidebarOpen = useOptionsBar(
    (s) => s.setFolderTreeSidebarOpen
  );
  const currentFolderId = useOptionsBar((s) => s.currentFolderId);
  const handleCurrentFolderChange = useOptionsBar(
    (s) => s.handleCurrentFolderChange
  );
  const handleFoldersModeChange = useOptionsBar(
    (s) => s.handleFoldersModeChange
  );

  const { folders, notesAndThoughts } = useControllers();
  const { data: allFolders = [] } = folders.useFetchAllFoldersQuery({
    enabled: open,
  });
  const { data: allNotes = [] } = notesAndThoughts.useFetchAllNotesQuery({
    enabled: open,
  });

  const currentFolder = useMemo(
    () => allFolders.find((folder) => folder.id === currentFolderId) ?? null,
    [allFolders, currentFolderId]
  );

  const breadcrumbItems = useMemo(() => {
    const root = { id: FOLDER_TREE_ROOT_ID, name: "Root" };
    if (!currentFolder) return [root];
    const ids = getFolderIdsFromPath(currentFolder.path);
    const byId = new Map(allFolders.map((folder) => [folder.id, folder]));
    return [
      root,
      ...ids.map((id) => ({
        id,
        name: byId.get(id)?.label ?? id,
      })),
    ];
  }, [allFolders, currentFolder]);

  const files = useMemo<FolderTreeFile[]>(
    () =>
      (allNotes ?? []).map((note) => ({
        id: note.id,
        title: note.title || "Untitled",
        folderId: note.folder_id ?? null,
      })),
    [allNotes]
  );

  const onSelect = (folderId: string | null) => {
    handleFoldersModeChange("with");
    handleCurrentFolderChange(folderId);
  };

  const onNavigateBreadcrumb = (id: string) => {
    onSelect(id === FOLDER_TREE_ROOT_ID ? null : id);
  };

  const onFileSelect = (fileId: string) => {
    setFolderTreeSidebarOpen(false);
    router.push({ pathname: "/notes/[id]", params: { id: fileId } });
  };

  return (
    <Sidebar
      open={open}
      onClose={() => setFolderTreeSidebarOpen(false)}
      side="right"
      header={
        <View
          className="h-10 w-full flex-row items-center overflow-hidden rounded-full"
          style={{ backgroundColor: hsl("card", colorScheme) }}
        >
          <Breadcrumbs
            items={breadcrumbItems}
            onNavigate={onNavigateBreadcrumb}
          />
        </View>
      }
    >
      <ScrollView
        className="flex-1"
        nestedScrollEnabled
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{
          paddingHorizontal: 8,
          paddingTop: 8,
          paddingBottom: 16,
          flexGrow: 1,
        }}
      >
        <FolderTree
          folders={allFolders}
          selectedFolderId={currentFolderId}
          onSelect={onSelect}
          showFiles
          files={files}
          onFileSelect={onFileSelect}
          scrollable={false}
        />
      </ScrollView>
    </Sidebar>
  );
}
