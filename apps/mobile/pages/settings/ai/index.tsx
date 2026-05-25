import * as React from "react";
import { PageContainer } from "@/components/layout/page/pageContainer";

import { AISettingsFeature } from "@/features/settings/features/ai/views";

export const AiSettingsPage = () => {
  return (
    <PageContainer headerVariant="tab" title="AI">
      <AISettingsFeature />
    </PageContainer>
  );
};
