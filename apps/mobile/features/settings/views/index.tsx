import * as React from "react";
import List from "@/components/ui/list";
import ListItem from "@/components/ui/list-item";
// import { ThemeSettingItem } from "@/features/settings/theme/ThemeItem";
import { SpaceFiller } from "@/components/ui/spaceFiller";
import { useRouter } from "expo-router";
import { Icon } from "@/components/ui/icons/icon";

export const SettingsFeature = () => {
  const { push } = useRouter();

  return (
    <>
      <List>
        <ListItem
          className="bg-background"
          itemLeft={() => <Icon name="brain" color="foreground" />} // props adds size and color attributes
          label="AI"
          onPress={() => push("/settings/ai")}
        />
        <ListItem
          className="bg-background"
          itemLeft={() => <Icon name="layers" color="foreground" />}
          label="Workspaces"
          onPress={() => push("/settings/workspaces")}
        />
        <ListItem
          className="bg-background"
          itemLeft={() => <Icon name="brackets-curly" color="foreground" />}
          label="Developer Options"
          onPress={() => push("/settings/developer")}
        />
        <ListItem
          className="bg-background"
          itemLeft={() => <Icon name="info" color="foreground" />}
          label="About App"
          onPress={() => push("/settings/aboutApp")}
        />
      </List>
      <SpaceFiller
        sizes={{
          marginBottom: ["TAB_BAR_PADDING_COMPENSATION", "TAB_BAR_HEIGHT", 20],
        }}
      />
    </>
  );
};
