import { Card } from "@/components/ui/card";
import { Typography } from "@/components/ui/typography";

import { EnableBiometricKeyRecovery } from "@/features/settings/features/recoveryKeys/components/enableBiometricKeyRecovery";
import { Gutter } from "@/components/ui/gutter";
import { ScrollView } from "react-native";
import { WorkspaceRecovery } from "../components/workspaceRecovery";
export const DatabaseRecoveryFeature = () => {
  return (
    <ScrollView contentContainerStyle={{ gap: 12, paddingBottom: 24 }}>
      <EnableBiometricKeyRecovery />

      <Card>
        <Gutter size="md" className="py-3 gap-3">
          <Typography variant="h3" padding>
            Recovery Keys
          </Typography>
          <Typography variant="muted" padding>
            Tap Recover key and authenticate with biometrics to view a workspace
            database encryption key. Keys stay hidden until you recover them.
            The biometric recovery must be enabled.
          </Typography>

          <WorkspaceRecovery />
        </Gutter>
      </Card>
    </ScrollView>
  );
};
