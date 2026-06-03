import React from "react";
import { useAISettingsPreferences } from "@/features/settings/context/ai";
import { SwitchSetting } from "@/features/settings/components/switchSetting";

export const AutoConnectSettings = () => {
  const { autoConnect, setAutoConnect } = useAISettingsPreferences();

  return (
    <SwitchSetting
      title="Auto Connect"
      description="Automatically connect to the AI engines when the app is launched."
      checked={autoConnect}
      onCheckedChange={setAutoConnect}
      accessibilityLabel="Auto Connect"
    />
  );
};
