import { EnableBiometricKeyRecovery } from "@/features/settings/features/recoveryKeys/components/enableBiometricKeyRecovery";

import { ScrollView } from "react-native";
import { WorkspaceRecovery } from "../components/workspaceRecovery";
import { CustomSettingComponent } from "@/features/settings/components/customSettingComponent";
export const DatabaseRecoveryFeature = () => {
  return (
    <ScrollView contentContainerStyle={{ gap: 12, paddingBottom: 24 }}>
      <EnableBiometricKeyRecovery />

      <CustomSettingComponent
        title="Recovery Keys"
        description="Tap Recover key to view a workspace database encryption key. It will be useful to transfer your workspace to a new device."
      >
        <WorkspaceRecovery />
      </CustomSettingComponent>
    </ScrollView>
  );
};
