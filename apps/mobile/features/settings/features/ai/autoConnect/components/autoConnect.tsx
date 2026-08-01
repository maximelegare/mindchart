import React from "react";
import { useAISettingsPreferences } from "@/features/settings/context/ai";
import { SwitchSetting } from "@/features/settings/components/switchSetting";

export const AutoConnectSettings = () => {
  const { autoConnect, setAutoConnect } = useAISettingsPreferences();

  return (
    <SwitchSetting
      title="Auto Connect"
      description="Automatically connect Whisper and Llama Chat when the app is launched. Embeddings always connect automatically."
      checked={autoConnect}
      onCheckedChange={setAutoConnect}
      accessibilityLabel="Auto Connect"
    />
  );
};
