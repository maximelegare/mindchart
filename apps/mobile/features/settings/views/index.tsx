import * as React from "react";
import { Linking, Platform } from "react-native";
import List, { ListHeader } from "@/components/ui/list";
import ListItem from "@/components/ui/list-item";
import { Muted } from "@/components/ui/typography";
import { Send, Star } from "@/lib/icons";
import * as WebBrowser from "expo-web-browser";
import { ThemeSettingItem } from "@/features/settings/theme/ThemeItem";
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
        <ThemeSettingItem />
        <ListItem
          className="bg-background"
          itemLeft={() => <Icon name="cpu" color="foreground" />} // props adds size and color attributes
          label="Ai Settings"
          onPress={() => push("/settings/ai")}
        />
        <ListItem
          className="bg-background"
          itemLeft={() => <Icon name="database" color="foreground" />}
          label="Database"
          onPress={() => push("/settings/database")}
        />
        <ListHeader className="pt-8">
          <Muted>GENERAL</Muted>
        </ListHeader>
        <ListItem
          className="bg-background"
          itemLeft={(props) => <Star {...props} />} // props adds size and color attributes
          label="Give us a start"
          onPress={() =>
            openExternalURL("https://github.com/expo-starter/expo-template")
          }
        />

        <ListItem
          className="bg-background"
          itemLeft={(props) => <Send {...props} />} // props adds size and color attributes
          label="Send Feedback"
          onPress={() => openExternalURL("https://expostarter.com")}
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
