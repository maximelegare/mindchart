import { View } from "react-native";
import { CreateWorkspaceRow } from "@/features/settings/features/workspaces/components/createWorkspaceRow";
import { ImportWorkspaceRow } from "@/features/settings/features/workspaces/components/importWorkspaceRow";
import { BiometricRecoverySetupRow } from "@/features/settings/features/workspaces/components/biometricRecoverySetupRow";
import { DatabaseRecoveryRow } from "@/features/settings/features/workspaces/components/databaseRecoveryRow";
import { useSecuritySettingsPreferences } from "@/features/settings/context/security";
import List from "@/components/ui/list";
import { NewWorkspaceLayout } from "../components/newWorkspaceLayout";

export const WorkspaceSettingsFeature = () => {
  const biometricRecoveryEnabled = useSecuritySettingsPreferences(
    (s) => s.biometricRecoveryEnabled
  );

  return (
    <View className="flex-col gap-4">
      <NewWorkspaceLayout />
      <List>
        <BiometricRecoverySetupRow />
        {biometricRecoveryEnabled ? <DatabaseRecoveryRow /> : null}
        <CreateWorkspaceRow />
        <ImportWorkspaceRow />
      </List>
    </View>
  );
};
