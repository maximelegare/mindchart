import * as React from "react";
import { Linking, Platform } from "react-native";
import List, { ListHeader } from "@/components/ui/list";
import ListItem from "@/components/ui/list-item";
import { Muted } from "@/components/ui/typography";
import * as WebBrowser from "expo-web-browser";
// import { ThemeSettingItem } from "@/features/settings/theme/ThemeItem";
import { SpaceFiller } from "@/components/ui/spaceFiller";
import { useRouter } from "expo-router";
import { Icon } from "@/components/ui/icons/icon";

export const SettingsFeature = () => {
  const { push } = useRouter();

  const openExternalURL = (url: string) => {
    if (Platform.OS === "web") {
      Linking.openURL(url);
    } else {
      WebBrowser.openBrowserAsync(url);
    }
  };
  return (
    <>
      <List>
        <ListHeader>
          <Muted>App</Muted>
        </ListHeader>
        {/* <ThemeSettingItem /> */}
        <ListItem
          className="bg-background"
          itemLeft={() => <Icon name="brain" color="foreground" />} // props adds size and color attributes
          label="Ai Settings"
          onPress={() => push("/settings/ai")}
        />
        <ListItem
          className="bg-background"
          itemLeft={() => <Icon name="layers" color="foreground" />}
          label="Workspaces"
          onPress={() => push("/settings/workspace")}
        />
        <ListItem
          className="bg-background"
          itemLeft={() => <Icon name="brackets-curly" color="foreground" />}
          label="Developer Options"
          onPress={() => push("/settings/developer")}
        />
        <ListHeader className="pt-8">
          <Muted>GENERAL</Muted>
        </ListHeader>
        <ListItem
          className="bg-background"
          itemLeft={() => <Icon name="star" color="foreground" />}
          label="Give us a star"
          onPress={() =>
            openExternalURL("https://github.com/maximelegare/mindchart")
          }
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
