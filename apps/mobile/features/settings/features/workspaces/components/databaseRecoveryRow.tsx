import { useCallback, useState } from "react";
import { useFocusEffect, useRouter } from "expo-router";
import ListItem from "@/components/ui/list-item";
import { Icon } from "@/components/ui/icons/icon";
import { isBiometricRecoveryEnabled } from "@/features/workspaces/keys/workspaceKeyManager";

export const DatabaseRecoveryRow = () => {
  const router = useRouter();
  const [enabled, setEnabled] = useState(isBiometricRecoveryEnabled);

  useFocusEffect(
    useCallback(() => {
      setEnabled(isBiometricRecoveryEnabled());
    }, [])
  );

  if (!enabled) return null;

  return (
    <ListItem
      itemLeft={() => <Icon name="lock-keyhole" color="foreground" />}
      label="Database key recovery"
      description="View workspace encryption keys after biometric authentication"
      onPress={() => router.push("/settings/workspaces/recovery")}
      borderBottom={false}
    />
  );
};
