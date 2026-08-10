import { SettingsSection } from "@/features/settings/components/settingsSection";
import { SettingsSheetRow } from "@/features/settings/components/settingsSheetRow";
import { WorkspacesSheetContent } from "./workspacesSheetContent";
import { RecoveryPasswordFeature } from "@/features/settings/features/recoveryPassword/views/recoveryPassword";
import { useWorkSpaces } from "@/features/workspaces/hooks/useWorkSpaces";

export function WorkspacesSettingsSection() {
  const { activeWorkspace } = useWorkSpaces();

  return (
    <SettingsSection title="Workspaces">
      <SettingsSheetRow
        label="Workspaces"
        value={activeWorkspace?.name}
        icon="layers"
        sheetTitle="Workspaces"
      >
        <WorkspacesSheetContent />
      </SettingsSheetRow>

      <SettingsSheetRow
        label="Recovery Password"
        icon="key-round"
        sheetTitle="Recovery Password"
        borderBottom={false}
      >
        <RecoveryPasswordFeature />
      </SettingsSheetRow>
    </SettingsSection>
  );
}
