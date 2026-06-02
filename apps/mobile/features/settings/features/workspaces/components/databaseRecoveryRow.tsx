import { useRouter } from "expo-router";
import ListItem from "@/components/ui/list-item";
import { Icon } from "@/components/ui/icons/icon";
import { useWorkspaceKeyRecovery } from "@/features/settings/features/recoveryKeys/hooks/useWorkspaceKeyRecovery";

export const DatabaseRecoveryRow = () => {
  const router = useRouter();
  const { biometricRecoveryEnabled } = useWorkspaceKeyRecovery();

  if (!biometricRecoveryEnabled) return null;

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
