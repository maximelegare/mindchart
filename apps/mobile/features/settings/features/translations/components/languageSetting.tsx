import { SettingsSection } from "@/features/settings/components/settingsSection";
import { LanguagesSheetRow } from "./languagesSheetRow";

export function LanguageSettingSection() {
  return (
    <SettingsSection title="Language" icon="languages">
      <LanguagesSheetRow />
    </SettingsSection>
  );
}
