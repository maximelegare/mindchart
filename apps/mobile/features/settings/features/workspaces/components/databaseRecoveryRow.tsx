import { useRouter } from "expo-router";
import ListItem from "@/components/ui/list-item";
import { Icon } from "@/components/ui/icons/icon";

export const RecoveryPasswordRow = () => {
  const router = useRouter();

  return (
    <ListItem
      itemLeft={() => <Icon name="key-round" color="foreground" />}
      label="Recovery passphrase"
      borderBottom={false}
      onPress={() => router.push("/settings/workspaces/recovery")}
    />
  );
};
