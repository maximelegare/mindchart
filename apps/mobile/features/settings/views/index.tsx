import * as React from "react";
import { View } from "react-native";
import { SpaceFiller } from "@/components/ui/spaceFiller";
import { useRouter } from "expo-router";
import ListItem from "@/components/ui/list-item";
import { SettingsSection } from "@/features/settings/components/settingsSection";
import { ThemeSettingItem } from "@/features/settings/theme/ThemeItem";
import { AiSettingsSection } from "@/features/settings/features/ai/components/aiSettingsSection";
import { WorkspacesSettingsSection } from "@/features/settings/features/workspaces/components/workspacesSettingsSection";
import { LockScreenSettingsSection } from "@/features/lockScreen/views/lockScreenSettingsSection";
import { AppVersionFeature } from "@/features/settings/features/aboutApp/features/appVersion";

export const SettingsFeature = () => {
  const { push } = useRouter();

  return (
    <View className="flex-col gap-8">
      <SettingsSection title="Appearance" icon="palette">
        <ThemeSettingItem />
      </SettingsSection>

      <LockScreenSettingsSection />

      <AiSettingsSection />

      <WorkspacesSettingsSection />

      <SettingsSection title="About" icon="info">
        <AppVersionFeature />
      </SettingsSection>

      <SettingsSection title="Developer" icon="brackets-curly">
        <ListItem
          label="Developer Options"
          borderBottom={false}
          onPress={() => push("/settings/developer")}
        />
      </SettingsSection>

      <SpaceFiller
        sizes={{
          marginBottom: ["TAB_BAR_HEIGHT", 20],
        }}
      />
    </View>
  );
};
