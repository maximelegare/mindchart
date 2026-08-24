import React from "react";
import { View } from "react-native";
import List from "@/components/ui/list";
import { Typography } from "@/components/ui/typography";
import { Icon } from "@/components/ui/icons/icon";
import type { IconName } from "@/components/ui/icons/icon-registry";

type SettingsSectionProps = {
  title: React.ReactNode;
  icon?: IconName;
  children: React.ReactNode;
};

export function SettingsSection({
  title,
  icon,
  children,
}: SettingsSectionProps) {
  return (
    <View className="gap-2">
      <View
        className="flex-row items-center gap-2"
        style={{ paddingHorizontal: 4 }}
      >
        {icon ? <Icon name={icon} color="foreground" size={22} /> : null}
        <Typography variant="h3" padding={false}>
          {title}
        </Typography>
      </View>
      <List variant="grouped">{children}</List>
    </View>
  );
}
