import { View } from "react-native";
import { Folder } from "@repo/zod-schemas/src/schemas";
import { Icon } from "@/components/ui/icons/icon";
import { Typography } from "@/components/ui/typography";
import { FolderActionsMenu } from "@/features/contentList/features/folderContents/components/folderActionsMenu";

type FolderCardProps = {
  folder: Folder;
  onPress: () => void;
};

export const FolderCard = ({ folder, onPress }: FolderCardProps) => {
  return (
    <FolderActionsMenu
      target={{ kind: "folder", folder }}
      onNavigate={onPress}
      className="shrink-0"
    >
      <View className="bg-card rounded-2xl px-3.5 py-2.5 flex-row items-center gap-2 self-start">
        <Icon name="folder" color="muted-foreground" size={16} />
        <Typography variant="h4" numberOfLines={1} className="max-w-40">
          {folder.label}
        </Typography>
      </View>
    </FolderActionsMenu>
  );
};
