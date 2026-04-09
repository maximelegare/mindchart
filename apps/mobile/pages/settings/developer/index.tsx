import * as React from "react";
import { PageContainer } from "@/components/layout/page/pageContainer";
import { DeveloperSettingsFeature } from "@/features/settings/features/developer/views";

export const DeveloperSettingsPage = () => {
  return (
    <PageContainer headerVariant="tab" title="Developer Options">
      <DeveloperSettingsFeature />
    </PageContainer>
  );
};
