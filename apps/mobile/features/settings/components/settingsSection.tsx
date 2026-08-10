import React from "react";
import { View } from "react-native";
import List from "@/components/ui/list";
import { Typography } from "@/components/ui/typography";

type SettingsSectionProps = {
  title: string;
  children: React.ReactNode;
};

export function SettingsSection({ title, children }: SettingsSectionProps) {
  return (
    <View className="gap-2">
      <Typography variant="h3" padding={false} style={{ paddingHorizontal: 4 }}>
        {title}
      </Typography>
      <List>{children}</List>
    </View>
  );
}
