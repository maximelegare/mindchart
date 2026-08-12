import { Icon } from "@/components/ui/icons/icon";
import { useWorkSpaces } from "@/features/workspaces/hooks/useWorkSpaces";
import { useWorkspaceEditSheet } from "@/features/workspaces/components/manageWorkspaces/workspaceEditSheet";
import { Button, Typography } from "@/components/ui";
import { View } from "react-native";

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
      confirmLabel: "Create",
      description: "Each workspace has its own isolated database.",
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
        <Typography>New</Typography>
      </View>
    </Button>
  );
};
