import { View } from "react-native";
import { Typography } from "@/components/ui";
import { useControllers } from "@/api/controllers/useControllers";
import { useOptionsBar } from "@/features/contentList/components/optionsBar/context/optionBarContext";

/** Shown when browsing inside a folder — contents pipeline is a stub for now. */
export const FolderContentsEmptyView = () => {
  const currentFolderId = useOptionsBar((s) => s.currentFolderId);
  const { folders } = useControllers();
  folders.useFetchFolderContentsQuery(currentFolderId);

  return (
    <View className="items-center justify-center px-6 py-10">
      <Typography variant="p" className="text-center text-muted-foreground">
        This folder is empty.
      </Typography>
    </View>
  );
};
