import ListItem from "@/components/ui/list-item";
import { Icon } from "@/components/ui/icons/icon";
import { useWorkSpaces } from "../../../../workspaces/hooks/useWorkSpaces";

type Props = {
  onImported?: () => void;
};

export const ImportWorkspaceRow = ({ onImported }: Props) => {
  const { importWorkspace } = useWorkSpaces();

  return (
    <ListItem
      itemLeft={() => <Icon name="import" color="foreground" />}
      label="Import Workspace"
      onPress={async () => {
        const result = await importWorkspace();
        if (result.success) onImported?.();
      }}
      borderBottom={false}
      noChevron
    />
  );
};
