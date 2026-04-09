import { PageContainer } from "@/components/layout/page/pageContainer";
import { WorkspaceSettingsFeature } from "@/features/settings/features/workspace/views";

export const WorkspaceSettingsPage = () => {
  return (
    <PageContainer headerVariant="tab" title="Workspaces Settings">
      <WorkspaceSettingsFeature />
    </PageContainer>
  );
};
