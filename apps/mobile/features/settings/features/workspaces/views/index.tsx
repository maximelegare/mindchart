import { View } from "react-native";
import { CreateWorkspaceRow } from "@/features/settings/features/workspaces/components/createWorkspaceRow";
import { ImportWorkspaceRow } from "@/features/settings/features/workspaces/components/importWorkspaceRow";

import List from "@/components/ui/list";
import { NewWorkspaceLayout } from "../components/newWorkspaceLayout";
import { DatabaseRecoveryRow } from "../components/databaseRecoveryRow";

export const WorkspaceSettingsFeature = () => {
  return (
    <View className="flex-col gap-4">
      <NewWorkspaceLayout />
      <List>
        <DatabaseRecoveryRow />
        <CreateWorkspaceRow />
        <ImportWorkspaceRow />
      </List>
    </View>
  );
};
