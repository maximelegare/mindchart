import React from "react";
import { View } from "react-native";
import { Typography } from "@/components/ui";
import { Sidebar } from "@/components/ui/sidebar/sidebar";
import { useControllers } from "@/api/controllers/useControllers";
import { useOptionsBar } from "../optionsBar/context/optionBarContext";
import { FolderTree } from "./folderTree";

export function FolderTreeSidebar() {
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

  const { folders } = useControllers();
  const { data: allFolders = [] } = folders.useFetchAllFoldersQuery({
    enabled: open,
  });

  const onSelect = (folderId: string | null) => {
    handleFoldersModeChange("with");
    handleCurrentFolderChange(folderId);
  };

  return (
    <Sidebar
      open={open}
      onClose={() => setFolderTreeSidebarOpen(false)}
      side="right"
      header={
        <View className="pt-1">
          <Typography variant="h4">Folders</Typography>
        </View>
      }
    >
      <FolderTree
        folders={allFolders}
        selectedFolderId={currentFolderId}
        onSelect={onSelect}
        className="flex-1"
      />
    </Sidebar>
  );
}
