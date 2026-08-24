import { SettingsSection } from "@/features/settings/components/settingsSection";
import { LanguagesSheetRow } from "./languagesSheetRow";
import { SettingsLanguageSectionTitle } from "@/features/settings/settingsLabels";

export function LanguageSettingSection() {
  return (
    <SettingsSection title={<SettingsLanguageSectionTitle />} icon="languages">
      <LanguagesSheetRow />
    </SettingsSection>
  );
}
