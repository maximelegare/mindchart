import * as React from "react";
import { PageContainer } from "@/components/layout/page/pageContainer";
import { DatabaseSettingsFeature } from "@/features/settings/features/database/views";

export const DatabaseSettingsPage = () => {
  return (
    <PageContainer headerVariant="tab" title="Database">
      <DatabaseSettingsFeature />
    </PageContainer>
  );
};
