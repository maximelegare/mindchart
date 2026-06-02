import { useRouter } from "expo-router";
import ListItem from "@/components/ui/list-item";
import { Icon } from "@/components/ui/icons/icon";

/** Render only when biometric recovery is enabled (parent gates mounting). */
export const DatabaseRecoveryRow = () => {
  const router = useRouter();

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
