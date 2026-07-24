import { ScrollView, View } from "react-native";
import { Folder } from "@repo/zod-schemas/src/schemas";
import { Icon } from "@/components/ui/icons/icon";
import { Typography } from "@/components/ui/typography";
import { FolderActionsMenu } from "./folderActionsMenu";

type ChildFoldersRowProps = {
  folders: Folder[];
  onNavigate: (folderId: string) => void;
};

export const ChildFoldersRow = ({
  folders,
  onNavigate,
}: ChildFoldersRowProps) => {
  if (folders.length === 0) return null;

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{
        gap: 8,
        paddingHorizontal: 8,
        paddingVertical: 4,
      }}
    >
      {folders.map((folder) => (
        <FolderActionsMenu
          key={folder.id}
          target={{ kind: "folder", folder }}
          onNavigate={() => onNavigate(folder.id)}
        >
          <View className="flex-row items-center gap-1.5 rounded-full border border-border bg-input px-2.5 py-1.5">
            <Icon name="folder" color="text" size={14} />
            <Typography variant="p" className="text-sm" numberOfLines={1}>
              {folder.label}
            </Typography>
          </View>
        </FolderActionsMenu>
      ))}
    </ScrollView>
  );
};
