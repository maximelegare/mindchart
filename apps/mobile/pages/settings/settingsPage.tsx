import * as React from "react";
import { PageContainer } from "@/components/layout/page/pageContainer";

import { SettingsFeature } from "@/features/settings/views";

export const SettingsPage = () => {
  return (
    <PageContainer headerVariant="stack" title="Settings">
      <SettingsFeature />
    </PageContainer>
  );
};
