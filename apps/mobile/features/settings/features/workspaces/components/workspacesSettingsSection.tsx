import { SettingsSection } from "@/features/settings/components/settingsSection";
import { SettingsSheetRow } from "@/features/settings/components/settingsSheetRow";
import { WorkspacesSheetContent } from "./workspacesSheetContent";
import { RecoveryPassphraseFeature } from "@/features/settings/features/recoveryPassword/views/recoveryPassword";
import { useWorkSpaces } from "@/features/workspaces/hooks/useWorkSpaces";
import { useSecuritySettingsPreferences } from "@/features/settings/context/security";

export function WorkspacesSettingsSection() {
  const { activeWorkspace } = useWorkSpaces();
  const recoveryPassphraseEnabled = useSecuritySettingsPreferences(
    (s) => s.recoveryPassphraseEnabled
  );

  return (
    <SettingsSection title="Workspaces" icon="layers">
      <SettingsSheetRow
        label="Workspaces"
        subtitle={activeWorkspace?.name ?? "None"}
        sheetTitle="Workspaces"
      >
        <WorkspacesSheetContent />
      </SettingsSheetRow>

      <SettingsSheetRow
        label="Recovery passphrase"
        status={recoveryPassphraseEnabled ? "Enabled" : "Disabled"}
        dangerChevron
        sheetTitle="Recovery passphrase"
        snapPoints={["100%"]}
        borderBottom={false}
      >
        <RecoveryPassphraseFeature />
      </SettingsSheetRow>
    </SettingsSection>
  );
}
