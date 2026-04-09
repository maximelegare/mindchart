import List from "@/components/ui/list";
import { DatabaseBackupFeature } from "../features/backup/views";
import { DeleteWorkspaceFeature } from "../features/deleteWorkspace/components";

export const WorkspaceSettingsFeature = () => {
  return (
    <List>
      <DatabaseBackupFeature />
      <DeleteWorkspaceFeature />
    </List>
  );
};
