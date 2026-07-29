import { useMemo } from "react";
import { View } from "react-native";
import { useControllers } from "@/api/controllers/useControllers";
import { useOptionsBar } from "@/features/contentList/components/optionsBar/context/optionBarContext";
import { FolderCard } from "@/features/contentList/components/cards/folderCard";

export const FolderCardsList = () => {
  const currentFolderId = useOptionsBar((s) => s.currentFolderId);
  const handleCurrentFolderChange = useOptionsBar(
    (s) => s.handleCurrentFolderChange
  );
  const { folders } = useControllers();
  const { data: allFolders = [] } = folders.useFetchAllFoldersQuery();

  const currentFolder = useMemo(
    () => allFolders.find((f) => f.id === currentFolderId) ?? null,
    [allFolders, currentFolderId]
  );

  const parentPath = currentFolder?.path ?? null;
  const { data: childFolders = [] } =
    folders.useFetchChildFoldersQuery(parentPath);

  if (!childFolders || childFolders.length === 0) return null;

  return (
    <View
      className="flex-row flex-wrap items-start gap-2"
      style={{ paddingTop: 20, paddingBottom: 8 }}
    >
      {childFolders.map((folder) => (
        <FolderCard
          key={folder.id}
          folder={folder}
          onPress={() => handleCurrentFolderChange(folder.id)}
        />
      ))}
    </View>
  );
};
