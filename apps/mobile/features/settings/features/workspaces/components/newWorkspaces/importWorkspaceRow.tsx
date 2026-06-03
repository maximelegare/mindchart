import { Icon } from "@/components/ui/icons/icon";
import { useWorkSpaces } from "@/features/workspaces/hooks/useWorkSpaces";
import { Button, Typography } from "@/components/ui";
import { hsl } from "@/utils/hsl";
import { useColorScheme } from "@/lib/useColorScheme";
import { View } from "react-native";

type Props = {
  onImported?: () => void;
};

export const ImportWorkspaceRow = ({ onImported }: Props) => {
  const { importWorkspace } = useWorkSpaces();

  const { colorScheme } = useColorScheme();
  return (
    <Button
      variant="outline"
      style={{ backgroundColor: hsl("card", colorScheme) }}
      onPress={async () => {
        const result = await importWorkspace();
        if (result.success) onImported?.();
      }}
    >
      <View className="flex-row items-center gap-3">
        <Icon name="import" color="foreground" />
        <Typography>Import Workspace</Typography>
      </View>
    </Button>
  );
};
