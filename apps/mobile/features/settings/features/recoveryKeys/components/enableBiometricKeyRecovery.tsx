import { Alert, View } from "react-native";
import { Switch } from "@/components/ui/switch";
import { useWorkspaceKeyRecovery } from "@/features/settings/features/recoveryKeys/hooks/useWorkspaceKeyRecovery";
import { useWorkspacesStore } from "@/features/workspaces/context/workspacesContext";
import { Card } from "@/components/ui/card";
import { Gutter } from "@/components/ui/gutter";
import { Typography } from "@/components/ui/typography";

export const EnableBiometricKeyRecovery = () => {
  const workspaces = useWorkspacesStore((s) => s.workspaces);
  const {
    biometricRecoveryEnabled,
    biometricAvailable,
    busy,
    setBusy,
    setupBiometricRecovery,
  } = useWorkspaceKeyRecovery();

  const onToggle = async (next: boolean) => {
    if (busy || next === biometricRecoveryEnabled) return;

    if (!biometricAvailable) {
      Alert.alert(
        "Biometrics unavailable",
        "Use a device with Face ID or fingerprint enrolled, and a development build (not Expo Go)."
      );
      return;
    }

    setBusy(true);
    try {
      await setupBiometricRecovery(
        workspaces.map((w) => w.id),
        next
      );
    } catch (e) {
      Alert.alert(
        "Biometric recovery",
        e instanceof Error ? e.message : "Unknown error"
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <Card className="py-2">
      <Gutter size="md" className="py-3 flex-row gap-4">
        <View className="flex-1">
          <Typography variant="h3" padding>
            Biometric Recovery
          </Typography>
          <Typography variant="p" padding>
            Enable biometric recovery to recover database keys for your
            workspaces.
          </Typography>
        </View>
        <Switch
          checked={biometricRecoveryEnabled}
          disabled={!biometricAvailable || busy}
          onCheckedChange={onToggle}
          accessibilityLabel="Enable biometric recovery"
        />
      </Gutter>
    </Card>
  );
};
