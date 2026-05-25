import ListItem from "@/components/ui/list-item";
import { Icon } from "@/components/ui/icons/icon";
import { useWorkSpaces } from "../../../../workspaces/hooks/useWorkSpaces";

export const ExportActiveWorkspaceRow = () => {
  const { exportWorkspace, activeWorkspace } = useWorkSpaces();

  if (!activeWorkspace) return null;

  return (
    <ListItem
      className="bg-background"
      itemLeft={() => <Icon name="arrow-up-from-line" color="foreground" />}
      label="Export Active Workspace"
      description={activeWorkspace.name}
      onPress={async () => {
        await exportWorkspace();
      }}
      noChevron
    />
  );
};
