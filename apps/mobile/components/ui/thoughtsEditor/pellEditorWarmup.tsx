import React from "react";
import { Platform, View } from "react-native";
import { RichEditor } from "react-native-pell-rich-editor";

/**
 * Android kills the process if pell's WebView is first created while
 * navigating from the search sheet. Mount a 1px editor on a stable screen
 * first so Chromium is already running.
 */
export function PellEditorWarmup() {
  if (Platform.OS !== "android") return null;

  return (
    <View
      collapsable={false}
      pointerEvents="none"
      style={{
        position: "absolute",
        width: 1,
        height: 1,
        opacity: 0,
        overflow: "hidden",
      }}
    >
      <RichEditor
        disabled
        useContainer={false}
        initialContentHTML=""
        style={{ width: 1, height: 1 }}
        editorStyle={{ backgroundColor: "transparent" }}
      />
    </View>
  );
}
