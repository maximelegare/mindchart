import React from "react";
import { View } from "react-native";
import List from "@/components/ui/list";
import { Typography } from "@/components/ui/typography";
import { useColorScheme } from "@/lib/useColorScheme";
import { hsl } from "@/utils/hsl";

type SettingsSectionProps = {
  title: string;
  children: React.ReactNode;
};

export function SettingsSection({ title, children }: SettingsSectionProps) {
  const { colorScheme } = useColorScheme();

  return (
    <View className="gap-2">
      <Typography
        variant="h2"
        style={{
          fontSize: 22,
          fontWeight: "700",
          color: hsl("foreground", colorScheme),
          paddingHorizontal: 4,
        }}
      >
        {title}
      </Typography>
      <List>{children}</List>
    </View>
  );
}
