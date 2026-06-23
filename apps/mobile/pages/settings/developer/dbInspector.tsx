import * as React from "react";
import { PageContainer } from "@/components/layout/page/pageContainer";
import { DatabaseInspectorFeature } from "@/features/settings/features/developer/features/inspector/views";

export const DatabaseInspectorPage = () => {
  return (
    <PageContainer
      headerVariant="tab"
      title="SQLite Inspector"
      subtitle={{ text: "Settings / Developer Options", icon: "settings" }}
    >
      <DatabaseInspectorFeature />
    </PageContainer>
  );
};
