import { View } from "react-native";
import { CreateWorkspaceRow } from "@/features/settings/features/workspaces/components/createWorkspaceRow";
import { ImportWorkspaceRow } from "@/features/settings/features/workspaces/components/importWorkspaceRow";
import { BiometricRecoverySetupRow } from "@/features/settings/features/workspaces/components/biometricRecoverySetupRow";
import { DatabaseRecoveryRow } from "@/features/settings/features/workspaces/components/databaseRecoveryRow";
import List from "@/components/ui/list";
import { NewWorkspaceLayout } from "../components/newWorkspaceLayout";

export const WorkspaceSettingsFeature = () => {
  return (
    <View className="flex-col gap-4">
      <NewWorkspaceLayout />
      <List>
        <BiometricRecoverySetupRow />
        <DatabaseRecoveryRow />
        <CreateWorkspaceRow />
        <ImportWorkspaceRow />
      </List>
    </View>
  );
};
