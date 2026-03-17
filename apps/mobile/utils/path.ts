import { Platform } from "react-native";

export const normalizePath = (uri: string | null) => {
  if (!uri) return null;
  if (Platform.OS === "android") {
    // Ensure it starts with file:/// (3 slashes)
    if (uri.startsWith("file:/") && !uri.startsWith("file:///")) {
      return uri.replace("file:/", "file:///");
    }
    // If it's just a raw path without a protocol
    if (!uri.startsWith("file://")) {
      return `file://${uri}`;
    }
  }
  return uri;
};
