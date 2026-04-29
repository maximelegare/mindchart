import { Linking } from "react-native";
import { Platform } from "react-native";
import * as WebBrowser from "expo-web-browser";

export const openExternalURL = (url: string) => {
  if (Platform.OS === "web") {
    Linking.openURL(url);
  } else {
    WebBrowser.openBrowserAsync(url);
  }
};
