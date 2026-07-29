import React, { useMemo } from "react";
import { Pressable, ScrollView, View } from "react-native";
import { useRouter } from "expo-router";
import { canCreateChildFolder, getFolderIdsFromPath } from "@repo/sqlite";
import { Button } from "@/components/ui";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Icon } from "@/components/ui/icons/icon";
import { Sidebar } from "@/components/ui/sidebar/sidebar";
import { useControllers } from "@/api/controllers/useControllers";
import { useColorScheme } from "@/lib/useColorScheme";
import { hsl } from "@/utils/hsl";
import { useFolderActions } from "../optionsBar/hooks/useFolderActions";
import { useOptionsBar } from "../optionsBar/context/optionBarContext";
import { FolderBreadcrumbCrumb } from "../optionsBar/components/folders/folderActionsMenu";
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
  const { openCreateFolderModal } = useFolderActions();

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

  const canCreateHere = canCreateChildFolder(currentFolder?.path ?? null);

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

  const foldersById = useMemo(
    () => new Map(allFolders.map((folder) => [folder.id, folder])),
    [allFolders]
  );

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

  const onClose = () => setFolderTreeSidebarOpen(false);

  const onFileSelect = (fileId: string) => {
    onClose();
    router.push({ pathname: "/notes/[id]", params: { id: fileId } });
  };

  const onCreateFolder = () => {
    openCreateFolderModal(
      currentFolder
        ? { kind: "folder", folder: currentFolder }
        : { kind: "root" }
    );
  };

  const cardBg = hsl("card", colorScheme);

  return (
    <Sidebar
      open={open}
      onClose={onClose}
      side="right"
      width={360}
      header={
        <View className="w-full flex-row items-center gap-2">
          <Button variant="ghost" size="icon" onPress={onClose}>
            <Icon name="chevron-right" color="text" size={20} />
          </Button>
          <View
            className="h-10 min-w-0 flex-1 flex-row items-center overflow-hidden rounded-full"
            style={{ backgroundColor: cardBg }}
          >
            <Breadcrumbs
              items={breadcrumbItems}
              onNavigate={onNavigateBreadcrumb}
              renderItem={({ item, isLast }) => (
                <FolderBreadcrumbCrumb
                  item={item}
                  isLast={isLast}
                  folder={
                    item.id === FOLDER_TREE_ROOT_ID
                      ? null
                      : (foldersById.get(item.id) ?? null)
                  }
                  onNavigate={onNavigateBreadcrumb}
                />
              )}
            />
          </View>
          {canCreateHere ? (
            <Pressable
              onPress={onCreateFolder}
              className="min-w-10 h-10 shrink-0 flex-row items-center justify-center gap-1 rounded-full border px-3"
              style={{ backgroundColor: cardBg, borderColor: cardBg }}
              accessibilityRole="button"
              accessibilityLabel="New folder"
            >
              <Icon name="folder" color="muted-foreground" size={16} />
              <Icon name="plus" color="muted-foreground" size={14} />
            </Pressable>
          ) : null}
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
          enableFolderActions
          enableFileActions
          onFileActionNavigate={onClose}
          scrollable={false}
        />
      </ScrollView>
    </Sidebar>
  );
}
