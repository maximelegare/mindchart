import * as React from "react";
import { View } from "react-native";
import { SpaceFiller } from "@/components/ui/spaceFiller";
import { useRouter } from "expo-router";
import { Icon } from "@/components/ui/icons/icon";
import ListItem from "@/components/ui/list-item";
import { SettingsSection } from "@/features/settings/components/settingsSection";
import { ThemeSettingItem } from "@/features/settings/theme/ThemeItem";
import { AiSettingsSection } from "@/features/settings/features/ai/components/aiSettingsSection";
import { WorkspacesSettingsSection } from "@/features/settings/features/workspaces/components/workspacesSettingsSection";
import { AppVersionFeature } from "@/features/settings/features/aboutApp/features/appVersion";
import { SourceCodeFeature } from "@/features/settings/features/aboutApp/features/sourceCode";

export const SettingsFeature = () => {
  const { push } = useRouter();

  return (
    <View className="flex-col gap-8">
      <SettingsSection title="Appearance">
        <ThemeSettingItem />
      </SettingsSection>

      <AiSettingsSection />

      <WorkspacesSettingsSection />

      <SettingsSection title="About">
        <AppVersionFeature />
        <SourceCodeFeature />
      </SettingsSection>

      <SettingsSection title="Developer">
        <ListItem
          itemLeft={() => (
            <Icon name="brackets-curly" color="foreground" size={20} />
          )}
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
