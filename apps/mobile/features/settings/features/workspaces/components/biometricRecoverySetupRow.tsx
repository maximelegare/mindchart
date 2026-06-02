import { useCallback, useEffect, useState } from "react";
import { Alert } from "react-native";
import { useFocusEffect } from "expo-router";
import ListItem from "@/components/ui/list-item";
import { Icon } from "@/components/ui/icons/icon";
import { Switch } from "@/components/ui/switch";
import { View } from "react-native";
import {
  canUseBiometricRecovery,
  isBiometricRecoveryEnabled,
  setupBiometricRecovery,
} from "@/features/workspaces/keys/workspaceKeyManager";
import { useWorkspacesStore } from "@/features/workspaces/context/workspacesContext";

export const BiometricRecoverySetupRow = () => {
  const workspaces = useWorkspacesStore((s) => s.workspaces);
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const [enabled, setEnabled] = useState(isBiometricRecoveryEnabled);
  const [busy, setBusy] = useState(false);

  const refresh = useCallback(() => {
    setEnabled(isBiometricRecoveryEnabled());
    canUseBiometricRecovery().then(setBiometricAvailable);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh])
  );

  const onToggle = async (next: boolean) => {
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
      setEnabled(next);
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
            checked={enabled}
            disabled={!biometricAvailable}
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
