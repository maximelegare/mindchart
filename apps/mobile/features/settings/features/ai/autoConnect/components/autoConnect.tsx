import React from "react";
import { useAISettingsPreferences } from "@/features/settings/context/ai";
import { Typography } from "@/components/ui/typography";
import { Card } from "@/components/ui/card";
import { Gutter } from "@/components/ui/gutter";
import { Switch } from "@/components/ui/switch";
import { View } from "react-native";

export const AutoConnectSettings = () => {
  const { autoConnect, setAutoConnect } = useAISettingsPreferences();

  return (
    <Card>
      <Gutter size="md" className="py-3 flex-row gap-4">
        <View className="flex-1">
          <Typography variant="h3" padding>
            Auto Connect
          </Typography>
          <Typography variant="p" padding>
            Automatically connect to the AI engines when the app is launched.
          </Typography>
        </View>
        <Switch checked={autoConnect} onCheckedChange={setAutoConnect} />
      </Gutter>
    </Card>
  );
};
