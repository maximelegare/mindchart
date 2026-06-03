import { Alert } from "react-native";
import { useWorkspaceKeyRecovery } from "@/features/settings/features/recoveryKeys/hooks/useWorkspaceKeyRecovery";
import { useWorkspacesStore } from "@/features/workspaces/context/workspacesContext";
import { SwitchSetting } from "@/features/settings/components/switchSetting";

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
    <SwitchSetting
      title="Biometric Recovery"
      description="Enable biometric recovery to recover database keys for your workspaces."
      checked={biometricRecoveryEnabled}
      disabled={!biometricAvailable || busy}
      onCheckedChange={onToggle}
      accessibilityLabel="Enable biometric recovery"
    />
  );
};
