import List from "@/components/ui/list";
import { DatabaseBackupFeature } from "../features/backup/views";

export const WorkspaceSettingsFeature = () => {
  return (
    <List>
      <DatabaseBackupFeature />
    </List>
  );
};
