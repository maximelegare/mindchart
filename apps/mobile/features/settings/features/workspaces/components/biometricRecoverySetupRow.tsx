import { Alert, View } from "react-native";
import ListItem from "@/components/ui/list-item";
import { Icon } from "@/components/ui/icons/icon";
import { Switch } from "@/components/ui/switch";
import { useWorkspaceKeyRecovery } from "@/features/settings/features/recoveryKeys/hooks/useWorkspaceKeyRecovery";
import { useWorkspacesStore } from "@/features/workspaces/context/workspacesContext";

export const BiometricRecoverySetupRow = () => {
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
    <ListItem
      itemLeft={() => <Icon name="lock-keyhole" color="foreground" />}
      label="Biometric recovery"
      description={
        biometricAvailable
          ? "Back up database keys for recovery with Face ID or fingerprint"
          : "Requires biometrics on this device (dev build recommended)"
      }
      itemRight={() => (
        <View pointerEvents={busy ? "none" : "auto"}>
          <Switch
            checked={biometricRecoveryEnabled}
            disabled={!biometricAvailable || busy}
            onCheckedChange={onToggle}
            accessibilityLabel="Enable biometric recovery"
          />
        </View>
      )}
      noChevron
      borderBottom
    />
  );
};
