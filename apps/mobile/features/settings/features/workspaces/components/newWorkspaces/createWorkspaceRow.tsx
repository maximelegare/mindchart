import { Icon } from "@/components/ui/icons/icon";
import { useWorkSpaces } from "@/features/workspaces/hooks/useWorkSpaces";
import { useWorkspaceEditSheet } from "@/features/workspaces/components/manageWorkspaces/workspaceEditSheet";
import { Button, Typography } from "@/components/ui";
import { View } from "react-native";
import {
  settingsActionCreate,
  settingsActionNew,
} from "@/features/settings/settingsLabels";
import { settingsWorkspaceCreateDescription } from "@/features/settings/features/workspaces/labels/settingsWorkspacesLabels";

type Props = {
  onCreated?: () => void;
};

export const CreateWorkspaceRow = ({ onCreated }: Props) => {
  const { createWorkspace } = useWorkSpaces();
  const { openWorkspaceEditSheet, closeWorkspaceEditSheet } =
    useWorkspaceEditSheet();

  const open = () => {
    openWorkspaceEditSheet({
      mode: "create",
      confirmLabel: settingsActionCreate(),
      description: settingsWorkspaceCreateDescription(),
      onConfirm: async ({ name, color, icon }) => {
        closeWorkspaceEditSheet();
        await createWorkspace(name, { color, icon });
        onCreated?.();
      },
    });
  };

  return (
    <Button variant="default" className="w-full" onPress={open}>
      <View className="flex-row items-center gap-2">
        <Icon name="plus" color="background" />
        <Typography>{settingsActionNew()}</Typography>
      </View>
    </Button>
  );
};
