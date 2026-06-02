import { useRouter } from "expo-router";
import ListItem from "@/components/ui/list-item";
import { Icon } from "@/components/ui/icons/icon";

/** Render only when biometric recovery is enabled (parent gates mounting). */
export const DatabaseRecoveryRow = () => {
  const router = useRouter();

  return (
    <ListItem
      itemLeft={() => <Icon name="key-round" color="foreground" />}
      label="Database key recovery"
      onPress={() => router.push("/settings/workspaces/recovery")}
    />
  );
};
