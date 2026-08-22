import { SettingsSection } from "@/features/settings/components/settingsSection";
import { SettingsSheetRow } from "@/features/settings/components/settingsSheetRow";
import { WorkspacesSheetContent } from "./workspacesSheetContent";
import { RecoveryPassphraseFeature } from "@/features/settings/features/recoveryPassword/views/recoveryPassword";
import { useWorkSpaces } from "@/features/workspaces/hooks/useWorkSpaces";
import { useSecuritySettingsPreferences } from "@/features/settings/context/security";
import {
  SettingsWorkspacesSectionTitle,
  settingsRecoveryPassphraseRowLabel,
  settingsWorkspacesRowLabel,
} from "@/features/settings/settingsWorkspacesLabels";
import {
  settingsStatusDisabled,
  settingsStatusEnabled,
  settingsStatusNone,
} from "@/features/settings/settingsLabels";

export function WorkspacesSettingsSection() {
  const { activeWorkspace } = useWorkSpaces();
  const recoveryPassphraseEnabled = useSecuritySettingsPreferences(
    (s) => s.recoveryPassphraseEnabled
  );

  return (
    <SettingsSection title={<SettingsWorkspacesSectionTitle />} icon="layers">
      <SettingsSheetRow
        label={settingsWorkspacesRowLabel()}
        subtitle={activeWorkspace?.name ?? settingsStatusNone()}
        sheetTitle={settingsWorkspacesRowLabel()}
      >
        <WorkspacesSheetContent />
      </SettingsSheetRow>

      <SettingsSheetRow
        label={settingsRecoveryPassphraseRowLabel()}
        status={
          recoveryPassphraseEnabled
            ? settingsStatusEnabled()
            : settingsStatusDisabled()
        }
        statusTone={recoveryPassphraseEnabled ? "success" : "warning"}
        sheetTitle={settingsRecoveryPassphraseRowLabel()}
        snapPoints={["100%"]}
        borderBottom={false}
      >
        <RecoveryPassphraseFeature />
      </SettingsSheetRow>
    </SettingsSection>
  );
}
