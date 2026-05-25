import { PageContainer } from "@/components/layout/page/pageContainer";
import { WorkspaceSettingsFeature } from "@/features/settings/features/workspaces/views";

export const WorkspaceSettingsPage = () => {
  return (
    <PageContainer headerVariant="tab" title="Workspaces">
      <WorkspaceSettingsFeature />
    </PageContainer>
  );
};
