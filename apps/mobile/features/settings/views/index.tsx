import * as React from "react";
import { View } from "react-native";
import { SpaceFiller } from "@/components/ui/spaceFiller";
import { useRouter } from "expo-router";
import ListItem from "@/components/ui/list-item";
import { SettingsSection } from "@/features/settings/components/settingsSection";
import { ThemeSettingItem } from "@/features/settings/theme/ThemeItem";
import { LanguageSettingSection } from "@/features/settings/features/translations/components/languageSetting";
import { AiSettingsSection } from "@/features/settings/features/ai/components/aiSettingsSection";
import { WorkspacesSettingsSection } from "@/features/settings/features/workspaces/components/workspacesSettingsSection";
import { LockScreenSettingsSection } from "@/features/lockScreen/views/lockScreenSettingsSection";
import { AppVersionFeature } from "@/features/settings/features/aboutApp/features/appVersion";
import {
  SettingsAboutSectionTitle,
  SettingsAppearanceSectionTitle,
  SettingsDeveloperSectionTitle,
  settingsDeveloperOptionsLabel,
} from "@/features/settings/settingsLabels";

export const SettingsFeature = () => {
  const { push } = useRouter();

  return (
    <View className="flex-col gap-8">
      <SettingsSection
        title={<SettingsAppearanceSectionTitle />}
        icon="palette"
      >
        <ThemeSettingItem />
      </SettingsSection>
      <LanguageSettingSection />
      <LockScreenSettingsSection />
      <AiSettingsSection />
      <WorkspacesSettingsSection />
      <SettingsSection title={<SettingsAboutSectionTitle />} icon="info">
        <AppVersionFeature />
      </SettingsSection>
      <SettingsSection
        title={<SettingsDeveloperSectionTitle />}
        icon="brackets-curly"
      >
        <ListItem
          label={settingsDeveloperOptionsLabel()}
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
