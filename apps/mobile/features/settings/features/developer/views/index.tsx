import { SeedDatabaseFeature } from "../features/seed/seedDatabase";
import ListItem from "@/components/ui/list-item";
import { Icon } from "@/components/ui/icons/icon";
import { useRouter } from "expo-router";
import List from "@/components/ui/list";

export const DeveloperSettingsFeature = () => {
  const { push } = useRouter();
  return (
    <List>
      <SeedDatabaseFeature style={{ marginBottom: 20 }} />
      <ListItem
        borderTop
        className="bg-background"
        itemLeft={() => <Icon name="square-mouse-pointer" color="foreground" />}
        label="DB Inspector"
        onPress={() => push("/settings/developer/inspector")}
      />
    </List>
  );
};
