import * as React from "react";
import { PageContainer } from "@/components/layout/page/pageContainer";
import { DatabaseInspectorFeature } from "@/features/settings/features/database/inspector/views";

export const DatabaseInspectorPage = () => {
  return (
    <PageContainer headerVariant="tab" title="SQLite Inspector">
      <DatabaseInspectorFeature />
    </PageContainer>
  );
};
